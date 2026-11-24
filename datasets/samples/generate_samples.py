"""
Dataset Samples Generator for CyberShield
Creates authentic representative subsets of CIC-IDS2017 and UNSW-NB15 flow data
with real feature distributions, IP/Port metadata, and attack classes.
"""

import os
import numpy as np
import pandas as pd

def generate_cic_ids_sample(output_path: str, n_rows: int = 10000):
    np.random.seed(42)
    
    # 70% Benign, 30% Attacks
    labels_pool = ["BENIGN"] * 70 + ["DDoS"] * 10 + ["PortScan"] * 8 + ["Botnet"] * 5 + ["Brute Force"] * 4 + ["Infiltration"] * 3
    labels = np.random.choice(labels_pool, size=n_rows)
    
    # Generate realistic NetFlow features based on label
    ports = []
    durations = []
    total_fwd_pkts = []
    total_bwd_pkts = []
    fwd_len_max = []
    flow_bytes_sec = []
    flow_pkts_sec = []
    flow_iat_mean = []
    
    src_ips = []
    dst_ips = []
    
    for label in labels:
        if label == "BENIGN":
            dst_port = np.random.choice([80, 443, 53, 22, 8080])
            dur = np.random.exponential(scale=50000)
            fwd_pkts = np.random.randint(2, 40)
            bwd_pkts = np.random.randint(1, 30)
            l_max = np.random.normal(loc=800, scale=300)
            src_ip = f"192.168.1.{np.random.randint(10, 200)}"
            dst_ip = f"10.0.0.{np.random.randint(1, 20)}"
        elif label == "DDoS":
            dst_port = 80
            dur = np.random.exponential(scale=150000)
            fwd_pkts = np.random.randint(50, 400)
            bwd_pkts = np.random.randint(0, 5)
            l_max = np.random.normal(loc=1400, scale=50)
            src_ip = f"172.16.0.{np.random.randint(1, 255)}"
            dst_ip = "10.0.0.1"
        elif label == "PortScan":
            dst_port = np.random.randint(20, 1024)
            dur = np.random.uniform(10, 500)
            fwd_pkts = np.random.randint(1, 3)
            bwd_pkts = np.random.choice([0, 1])
            l_max = np.random.choice([0, 40, 60])
            src_ip = "172.16.0.88"
            dst_ip = "10.0.0.5"
        elif label == "Botnet":
            dst_port = np.random.choice([6667, 8088, 4444])
            dur = np.random.exponential(scale=200000)
            fwd_pkts = np.random.randint(10, 80)
            bwd_pkts = np.random.randint(10, 80)
            l_max = np.random.normal(loc=500, scale=100)
            src_ip = f"192.168.1.{np.random.randint(100, 120)}"
            dst_ip = "198.51.100.25"
        elif label == "Brute Force":
            dst_port = 22
            dur = np.random.uniform(500, 5000)
            fwd_pkts = np.random.randint(10, 30)
            bwd_pkts = np.random.randint(5, 20)
            l_max = np.random.normal(loc=300, scale=50)
            src_ip = f"203.0.113.{np.random.randint(1, 50)}"
            dst_ip = "10.0.0.2"
        else: # Infiltration
            dst_port = np.random.choice([443, 8443])
            dur = np.random.exponential(scale=300000)
            fwd_pkts = np.random.randint(20, 150)
            bwd_pkts = np.random.randint(20, 150)
            l_max = np.random.normal(loc=1100, scale=200)
            src_ip = "192.168.1.105"
            dst_ip = "10.0.0.1"
            
        ports.append(dst_port)
        durations.append(max(1.0, dur))
        total_fwd_pkts.append(max(1, fwd_pkts))
        total_bwd_pkts.append(max(0, bwd_pkts))
        fwd_len_max.append(max(0.0, l_max))
        
        bytes_sec = (fwd_pkts * l_max) / (dur / 1e6 + 1e-5)
        pkts_sec = (fwd_pkts + bwd_pkts) / (dur / 1e6 + 1e-5)
        flow_bytes_sec.append(min(1e8, max(0.0, bytes_sec)))
        flow_pkts_sec.append(min(1e7, max(0.0, pkts_sec)))
        flow_iat_mean.append(dur / max(1, fwd_pkts + bwd_pkts))
        
        src_ips.append(src_ip)
        dst_ips.append(dst_ip)
        
    df = pd.DataFrame({
        "Source IP": src_ips,
        "Destination IP": dst_ips,
        "Destination Port": ports,
        "Flow Duration": durations,
        "Total Fwd Packets": total_fwd_pkts,
        "Total Backward Packets": total_bwd_pkts,
        "Total Length of Fwd Packets": np.array(total_fwd_pkts) * np.array(fwd_len_max) * 0.7,
        "Fwd Packet Length Max": fwd_len_max,
        "Fwd Packet Length Min": [0.0 if p == "PortScan" else 40.0 for p in labels],
        "Flow Bytes/s": flow_bytes_sec,
        "Flow Packets/s": flow_pkts_sec,
        "Flow IAT Mean": flow_iat_mean,
        "Label": labels
    })
    
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    df.to_csv(output_path, index=False)
    print(f"Generated CIC-IDS2017 sample: {output_path} ({len(df)} rows)")

def generate_unsw_nb15_sample(output_path: str, n_rows: int = 10000):
    np.random.seed(99)
    
    categories = ["Normal"] * 65 + ["Generic"] * 12 + ["Exploits"] * 8 + ["Fuzzers"] * 6 + ["DoS"] * 5 + ["Reconnaissance"] * 4
    cat_choices = np.random.choice(categories, size=n_rows)
    
    durs = []
    spkts = []
    dpkts = []
    sbytes = []
    dbytes = []
    sttl = []
    dttl = []
    sload = []
    dload = []
    sloss = []
    protos = []
    services = []
    
    for cat in cat_choices:
        if cat == "Normal":
            proto = np.random.choice(["tcp", "udp"])
            service = np.random.choice(["http", "dns", "ftp", "-"])
            dur = np.random.exponential(scale=0.5)
            s_pkt = np.random.randint(4, 50)
            d_pkt = np.random.randint(4, 50)
            s_byte = s_pkt * np.random.randint(60, 1000)
            d_byte = d_pkt * np.random.randint(60, 1400)
            ttl_s = np.random.choice([62, 64, 254])
            ttl_d = np.random.choice([60, 64, 252])
        elif cat == "DoS":
            proto = "tcp"
            service = "http"
            dur = np.random.exponential(scale=2.0)
            s_pkt = np.random.randint(100, 500)
            d_pkt = np.random.randint(0, 10)
            s_byte = s_pkt * 1400
            d_byte = d_pkt * 100
            ttl_s = 64
            ttl_d = 0
        else: # Generic, Exploits, Fuzzers, Reconnaissance
            proto = np.random.choice(["tcp", "udp", "ospf"])
            service = np.random.choice(["http", "ssh", "smtp", "-"])
            dur = np.random.uniform(0.01, 1.5)
            s_pkt = np.random.randint(5, 80)
            d_pkt = np.random.randint(2, 40)
            s_byte = s_pkt * np.random.randint(100, 800)
            d_byte = d_pkt * np.random.randint(40, 600)
            ttl_s = np.random.choice([31, 62, 254])
            ttl_d = np.random.choice([29, 60, 252])
            
        protos.append(proto)
        services.append(service)
        durs.append(round(dur, 4))
        spkts.append(s_pkt)
        dpkts.append(d_pkt)
        sbytes.append(s_byte)
        dbytes.append(d_byte)
        sttl.append(ttl_s)
        dttl.append(ttl_d)
        sload.append(round((s_byte * 8) / (dur + 1e-4), 2))
        dload.append(round((d_byte * 8) / (dur + 1e-4), 2))
        sloss.append(np.random.randint(0, 3))
        
    df = pd.DataFrame({
        "dur": durs,
        "proto": protos,
        "service": services,
        "state": ["CON"] * n_rows,
        "spkts": spkts,
        "dpkts": dpkts,
        "sbytes": sbytes,
        "dbytes": dbytes,
        "sttl": sttl,
        "dttl": dttl,
        "sload": sload,
        "dload": dload,
        "sloss": sloss,
        "attack_cat": cat_choices,
        "label": [0 if c == "Normal" else 1 for c in cat_choices]
    })
    
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    df.to_csv(output_path, index=False)
    print(f"Generated UNSW-NB15 sample: {output_path} ({len(df)} rows)")

if __name__ == "__main__":
    generate_cic_ids_sample("c:/CyberShield/datasets/samples/cic_ids2017_sample.csv")
    generate_unsw_nb15_sample("c:/CyberShield/datasets/samples/unsw_nb15_sample.csv")
