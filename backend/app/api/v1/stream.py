from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from typing import Dict, Any
from app.services.stream_service import stream_manager

router = APIRouter(prefix="/stream", tags=["Real-time Traffic Stream"])

@router.websocket("/ws/traffic")
async def websocket_traffic_stream(websocket: WebSocket):
    """Frontend SOC Dashboard uchun real-time jonli tarmoq oqimi."""
    await stream_manager.connect(websocket)
    try:
        while True:
            # Keep-alive or handle client messages
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        stream_manager.disconnect(websocket)
    except Exception:
        stream_manager.disconnect(websocket)

@router.post("/control")
async def control_stream(
    action: str = Query("start"),
    speed: float = Query(1.0, ge=0.2, le=10.0),
    dataset_type: str = Query("CIC-IDS2017")
) -> Dict[str, Any]:
    """Jonli simulyatsiyani boshlash, to'xtatish yoki tezligini o'zgartirish."""
    stream_manager.set_speed(speed)
    if dataset_type != stream_manager.dataset_type:
        stream_manager.load_dataset(dataset_type)
        
    if action == "start":
        await stream_manager.start()
    else:
        await stream_manager.pause()
        
    return {
        "status": "success",
        "is_running": stream_manager.is_running,
        "speed": stream_manager.speed,
        "dataset_type": stream_manager.dataset_type
    }
