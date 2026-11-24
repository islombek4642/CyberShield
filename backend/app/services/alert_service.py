import httpx
import logging
from typing import Optional
from app.core.config import settings
from app.models.incident import Incident

logger = logging.getLogger("AlertDispatcher")

class AlertDispatcher:
    @classmethod
    async def dispatch_telegram_alert(cls, incident: Incident, chat_id: Optional[int] = None) -> bool:
        """
        Telegram orqali xavfli insident haqida inline tugmali alert yuboradi.
        """
        severity_emoji = "🔴" if incident.severity == "CRITICAL" else "🟠" if incident.severity == "HIGH" else "🟡"
        
        text = (
            f"🚨 *KIBERXAVFSIZLIK OGOHLANTIRISHI* 🚨\n\n"
            f"*Insident ID:* `#{incident.id}`\n"
            f"*Hujum turi:* `{incident.attack_type}`\n"
            f"*Xavf darajasi:* {severity_emoji} `{incident.severity}`\n"
            f"*Manba (Source):* `{incident.source_ip}`\n"
            f"*Nishon (Target):* `{incident.dest_ip}:{incident.dest_port}`\n"
            f"*Ishonch (Confidence):* `{int(incident.confidence * 100)}%`\n"
            f"*Vaqt:* `{incident.timestamp.strftime('%Y-%m-%d %H:%M:%S UTC')}`\n\n"
            f"Tizim monitoringi insidentni belgiladi. Amalni tanlang:"
        )
        
        # Inline keyboard
        reply_markup = {
            "inline_keyboard": [
                [
                    {"text": "✅ Tekshirildi", "callback_data": f"action:resolve:{incident.id}"},
                    {"text": "🔍 Ko'rib chiqilmoqda", "callback_data": f"action:review:{incident.id}"}
                ],
                [
                    {"text": "❌ Soxta signal", "callback_data": f"action:false_positive:{incident.id}"}
                ]
            ]
        }
        
        bot_token = settings.TELEGRAM_BOT_TOKEN
        # If bot token is configured and chat_id is known, send via Telegram Bot API
        if bot_token and chat_id:
            try:
                url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
                payload = {
                    "chat_id": chat_id,
                    "text": text,
                    "parse_mode": "Markdown",
                    "reply_markup": reply_markup
                }
                async with httpx.AsyncClient(timeout=5.0) as client:
                    resp = await client.post(url, json=payload)
                    return resp.status_code == 200
            except Exception as e:
                logger.error(f"Telegram alert yuborishda xatolik: {e}")
                return False
                
        # Console / Mock notification if Telegram token or chat_id is not yet set
        print(f"\n[TELEGRAM DISPATCHER MOCK] Alert triggered for Incident #{incident.id}: {incident.attack_type} ({incident.severity})")
        return True
