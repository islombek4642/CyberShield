// tgcloud/handlers/callback_query.js
// Handles inline button clicks for incident response

import { api } from 'sdk';
import { updateIncidentStatus } from '../lib/backendClient.js';

export default async function (callbackQuery, ctx) {
  const data = callbackQuery.data || '';
  const fromUser = callbackQuery.from?.username || `user_${callbackQuery.from?.id}`;
  const message = callbackQuery.message;

  // Format: "action:<status>:<incident_id>"
  // Example: "action:resolve:12"
  if (data.startsWith('action:')) {
    const [, action, idStr] = data.split(':');
    const incidentId = parseInt(idStr, 10);

    let newStatus = 'RESOLVED';
    let statusText = '✅ Tekshirildi va yopildi';

    if (action === 'review') {
      newStatus = 'IN_REVIEW';
      statusText = '🔍 Ko\'rib chiqilmoqda';
    } else if (action === 'false_positive') {
      newStatus = 'FALSE_POSITIVE';
      statusText = '❌ Soxta signal deb belgilandi';
    }

    // Call backend API
    await updateIncidentStatus(incidentId, newStatus, `@${fromUser}`);

    // Answer callback query popup
    await api.answerCallbackQuery({
      callback_query_id: callbackQuery.id,
      text: `Insident #${incidentId} holati: ${newStatus}`,
    });

    // Update message text
    if (message) {
      const updatedText =
        `${message.text}\n\n` +
        `➖➖➖➖➖➖➖➖➖➖\n` +
        `Holat: ${statusText}\n` +
        `Ijrochi: @${fromUser}`;

      await api.editMessageText({
        chat_id: message.chat.id,
        message_id: message.message_id,
        text: updatedText,
      });
    }
  }
}
