import { verifyTransaction } from '../lib/paystack.js'
import supabaseAdmin from '../lib/supabaseAdmin.js'

export const verifyChatUnlock = async (req, res) => {
  const { reference, target_id } = req.body
  const payer_id = req.user.id

  if (!reference || !target_id) {
    return res.status(400).json({ error: 'Missing reference or target_id' })
  }

  try {
    // verify with paystack
    const transaction = await verifyTransaction(reference)

    if (transaction.status !== 'success') {
      return res.status(400).json({ error: 'Payment not successful' })
    }

    if (transaction.amount < 5000) { // 50 KES in kobo
      return res.status(400).json({ error: 'Insufficient payment amount' })
    }

    // check not already unlocked
    const { data: existing } = await supabaseAdmin
      .from('chat_unlocks')
      .select('id')
      .eq('payer_id', payer_id)
      .eq('target_id', target_id)
      .single()

    if (existing) {
      return res.status(200).json({ message: 'Already unlocked', already: true })
    }

    // record unlock
    const { error: unlockError } = await supabaseAdmin
      .from('chat_unlocks')
      .insert({ payer_id, target_id, payment_reference: reference })

    if (unlockError) throw unlockError

    // create or get conversation
    const { data: existingConv } = await supabaseAdmin
      .from('conversations')
      .select('id')
      .or(
        `and(user1_id.eq.${payer_id},user2_id.eq.${target_id}),and(user1_id.eq.${target_id},user2_id.eq.${payer_id})`
      )
      .single()

    let conversationId

    if (existingConv) {
      conversationId = existingConv.id
    } else {
      const { data: newConv, error: convError } = await supabaseAdmin
        .from('conversations')
        .insert({ user1_id: payer_id, user2_id: target_id })
        .select('id')
        .single()

      if (convError) throw convError
      conversationId = newConv.id
    }

    return res.status(200).json({
      message: 'Chat unlocked',
      conversation_id: conversationId,
    })
  } catch (err) {
    console.error('verifyChatUnlock error:', err.message)
    return res.status(500).json({ error: 'Verification failed' })
  }
}

export const verifySupportPayment = async (req, res) => {
  const { reference, amount } = req.body
  const payer_id = req.user.id

  if (!reference || !amount) {
    return res.status(400).json({ error: 'Missing reference or amount' })
  }

  try {
    const transaction = await verifyTransaction(reference)

    if (transaction.status !== 'success') {
      return res.status(400).json({ error: 'Payment not successful' })
    }

    const { error } = await supabaseAdmin
      .from('support_payments')
      .insert({ payer_id, amount, payment_reference: reference })

    if (error && error.code !== '23505') throw error // ignore duplicate

    return res.status(200).json({ message: 'Support payment recorded' })
  } catch (err) {
    console.error('verifySupportPayment error:', err.message)
    return res.status(500).json({ error: 'Verification failed' })
  }
}