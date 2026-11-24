from sqlalchemy.orm import Session
from datetime import datetime, timezone, timedelta
from app.core.database import SessionLocal, Base, engine
from app.core.security import get_password_hash
from app.models.user import User
from app.models.incident import Incident, IncidentStatus, IncidentSeverity

def init_db():
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()
    try:
        # 1. Create default admin if not exists
        admin = db.query(User).filter(User.username == "soc_admin").first()
        if not admin:
            admin = User(
                username="soc_admin",
                email="admin@cybershield.local",
                hashed_password=get_password_hash("Password123!"),
                role="admin"
            )
            db.add(admin)
            db.commit()
            print("✓ Default SOC Admin created: soc_admin / Password123!")

        # 2. Seed initial demo incidents if table is empty
        if db.query(Incident).count() == 0:
            now = datetime.now(timezone.utc)
            sample_incidents = [
                Incident(
                    timestamp=now - timedelta(minutes=14),
                    source_ip="172.16.0.88",
                    dest_ip="10.0.0.1",
                    dest_port=80,
                    protocol="TCP",
                    attack_type="DDoS",
                    severity=IncidentSeverity.CRITICAL,
                    confidence=0.98,
                    status=IncidentStatus.NEW
                ),
                Incident(
                    timestamp=now - timedelta(minutes=8),
                    source_ip="192.168.1.105",
                    dest_ip="10.0.0.5",
                    dest_port=443,
                    protocol="TCP",
                    attack_type="PortScan",
                    severity=IncidentSeverity.HIGH,
                    confidence=0.91,
                    status=IncidentStatus.IN_REVIEW,
                    reviewed_by="soc_admin"
                ),
                Incident(
                    timestamp=now - timedelta(minutes=3),
                    source_ip="203.0.113.42",
                    dest_ip="10.0.0.2",
                    dest_port=22,
                    protocol="TCP",
                    attack_type="Brute Force",
                    severity=IncidentSeverity.HIGH,
                    confidence=0.95,
                    status=IncidentStatus.RESOLVED,
                    reviewed_by="soc_admin",
                    resolution_notes="IP blocked at border firewall"
                ),
                Incident(
                    timestamp=now - timedelta(minutes=1),
                    source_ip="198.51.100.25",
                    dest_ip="10.0.0.1",
                    dest_port=8088,
                    protocol="TCP",
                    attack_type="Botnet",
                    severity=IncidentSeverity.CRITICAL,
                    confidence=0.94,
                    status=IncidentStatus.NEW
                ),
            ]
            db.add_all(sample_incidents)
            db.commit()
            print("✓ Seeded 4 initial security incidents for SOC demonstration.")
    finally:
        db.close()
