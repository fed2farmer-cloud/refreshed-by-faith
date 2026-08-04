import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req,res){
  if(req.method!=='POST') return res.status(405).json({error:'Method not allowed'});
  const stripeKey=process.env.STRIPE_SECRET_KEY;
  const supabaseUrl=process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceKey=process.env.SUPABASE_SERVICE_ROLE_KEY;
  if(!stripeKey) return res.status(500).json({error:'Server configuration missing: STRIPE_SECRET_KEY.'});
  if(!supabaseUrl) return res.status(500).json({error:'Server configuration missing: SUPABASE_URL.'});
  if(!serviceKey) return res.status(500).json({error:'Server configuration missing: SUPABASE_SERVICE_ROLE_KEY.'});
  try{
    const stripe=new Stripe(stripeKey);
    const admin=createClient(supabaseUrl.replace(/\/(rest\/v1)?\/?$/,''),serviceKey);
    const token=(req.headers.authorization||'').replace('Bearer ','');
    if(!token) return res.status(401).json({error:'Please sign in again before paying.'});
    const{data:{user},error:userError}=await admin.auth.getUser(token);
    if(userError||!user) return res.status(401).json({error:'Your sign-in session is no longer valid. Please sign in again.'});
    const{applicationId}=req.body||{};
    if(!applicationId) return res.status(400).json({error:'Application ID is required.'});
    const{data:app,error:appError}=await admin.from('applications').select('id,user_id,status').eq('id',applicationId).eq('user_id',user.id).single();
    if(appError||!app) return res.status(404).json({error:'Application not found.'});
    const forwardedProto=(req.headers['x-forwarded-proto']||'https').toString().split(',')[0];
    const host=req.headers.host;
    const base=`${forwardedProto}://${host}`;
    const session=await stripe.checkout.sessions.create({mode:'payment',customer_email:user.email,line_items:[{price_data:{currency:'usd',unit_amount:3500,product_data:{name:'Refreshed By Faith Application Fee',description:'Housing application processing fee'}},quantity:1}],metadata:{application_id:app.id,user_id:user.id},success_url:`${base}/dashboard?payment=success`,cancel_url:`${base}/dashboard?payment=cancelled`});
    const{error:paymentError}=await admin.from('application_payments').insert({application_id:app.id,user_id:user.id,amount_cents:3500,status:'checkout_created',stripe_checkout_session_id:session.id});
    if(paymentError) return res.status(500).json({error:`Payment record could not be created: ${paymentError.message}`});
    return res.status(200).json({url:session.url});
  }catch(e){return res.status(500).json({error:e instanceof Error?e.message:'Unable to start payment.'});}
}
