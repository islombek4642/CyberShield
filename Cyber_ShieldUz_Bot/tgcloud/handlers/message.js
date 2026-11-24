// tgcloud/handlers/message.js
// Handles user commands: /start, /help, /status, /report, /history, /link

import { api } from 'sdk';
import { getSecuritySummary, linkTelegramAccount } from '../lib/backendClient.js';

export default async function (message, ctx) {
  const text = (message.text || '').trim();
  const chatId = message.chat.id;

  if (text === '/start') {
    const welcome =
      `🛡 *CyberShield Security Operations Bot* ga xush kelibsiz!\n\n` +
      `Ushbu bot tarmoqdagi xurujlar (DDoS, PortScan, Infiltration, Botnet) ni real vaqtda monitoring qiladi va tahlilchilarga tezkor ogohlantirishlar jo'natadi.\n\n` +
      `*Mavjud buyruqlar:*\n` +
      `📊 /status — Tizim va monitoring holati\n` +
      `📈 /report — Xavfsizlik hisoboti\n` +
      `📜 /history — Oxirgi aniqlangan hodisalar\n` +
      `🔗 /link <kod> — Web-profil bilan bog'lash\n` +
      `ℹ️ /help — Yordam va ma'lumot`;

    await api.sendMessage({
      chat_id: chatId,
      text: welcome,
      parse_mode: 'Markdown',
    });
    return;
  }

  if (text === '/help') {
    const helpText =
      `ℹ️ *CyberShield Bot Qo'llanmasi*\n\n` +
      `• *Alertlar:* Tizimda yuqori xavfli tarmoq oqimi aniqlansa, bot sizga darhol signal beradi.\n` +
      `• *Harakatlar:* Siz xabardagi [✅ Tekshirildi] yoki [🔍 Ko'rib chiqilmoqda] tugmasi orqali insidentni bevosita botdan yopa olasiz.\n` +
      `• *Profilingizni ulash:* Web platformadagi 'Settings' sahifasidan 6 xonali kod olib, \`/link <kod>\` yuboring.`;

    await api.sendMessage({
      chat_id: chatId,
      text: helpText,
      parse_mode: 'Markdown',
    });
    return;
  }

  if (text === '/status') {
    const summary = await getSecuritySummary();
    if (!summary) {
      await api.sendMessage({
        chat_id: chatId,
        text: `🟢 *Tizim holati:* CyberShield Serverless Engine faol.\nBackend bilan aloqa: Mahalliy rejimda ishlamoqda.`,
        parse_mode: 'Markdown',
      });
      return;
    }

    const statusMsg =
      `🛡 *CyberShield Monitoring Holati:*\n\n` +
      `• Jami insidentlar: \`${summary.total_incidents}\`\n` +
      `• Yangi (New): \`${summary.status_breakdown.new}\`\n` +
      `• Ko'rib chiqilmoqda (In Review): \`${summary.status_breakdown.in_review}\`\n` +
      `• Hal qilingan (Resolved): \`${summary.status_breakdown.resolved}\`\n` +
      `• Kritik (Critical): 🔴 \`${summary.critical_count}\`\n` +
      `• Yuqori (High): 🟠 \`${summary.high_count}\``;

    await api.sendMessage({
      chat_id: chatId,
      text: statusMsg,
      parse_mode: 'Markdown',
    });
    return;
  }

  if (text === '/report') {
    const summary = await getSecuritySummary();
    const total = summary ? summary.total_incidents : 0;
    const reportMsg =
      `📊 *CyberShield Kiberxavfsizlik Jamlanmasi:*\n\n` +
      `Tahlil qilingan NetFlow oqimlari to'plami bo'yicha insidentlar soni: \`${total}\` ta.\n` +
      `Eng ko'p uchragan xurujlar: DDoS, PortScan, Brute Force va Botnet.\n` +
      `Tizim barcha oqimlarni Machine Learning yordamida uzluksiz tekshirmoqda.`;

    await api.sendMessage({
      chat_id: chatId,
      text: reportMsg,
      parse_mode: 'Markdown',
    });
    return;
  }

  if (text.startsWith('/link')) {
    const parts = text.split(' ');
    if (parts.length < 2) {
      await api.sendMessage({
        chat_id: chatId,
        text: `⚠️ Iltimos, ulanish kodini kiriting: \`/link <kod>\``,
        parse_mode: 'Markdown',
      });
      return;
    }
    const code = parts[1].trim();
    const res = await linkTelegramAccount(chatId, code);
    await api.sendMessage({
      chat_id: chatId,
      text: res ? `✅ Hisobingiz CyberShield platformasiga ulandi!` : `⚠️ Ulanishda xatolik yuz berdi. Kodni tekshiring.`,
    });
    return;
  }

  // Default response
  await api.sendMessage({
    chat_id: chatId,
    text: `Noma'lum buyruq. Mavjud buyruqlarni ko'rish uchun /help ni bosing.`,
  });
}
