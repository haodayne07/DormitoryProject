from app import create_app
from apscheduler.schedulers.background import BackgroundScheduler
import requests

app = create_app()

def trigger_monthly_billing():
    """Hàm này sẽ tự động chạy ngầm và gọi API sinh hóa đơn mỗi tháng"""
    print("⏰ HỆ THỐNG ĐANG TỰ ĐỘNG QUÉT VÀ PHÁT HÀNH HÓA ĐƠN THÁNG MỚI...")
    try:
        # Gọi thẳng vào API quét tự động (Chạy ngầm ở localhost)
        response = requests.post('http://127.0.0.1:5000/api/billing/auto-generate')
        print("✅ Kết quả phát hành:", response.json())
    except Exception as e:
        print("❌ Lỗi tự động sinh hóa đơn:", e)

# Khởi tạo bộ đếm thời gian
scheduler = BackgroundScheduler()

# Cấu hình: Cứ đúng ngày 1 hàng tháng, vào lúc 00:05 sáng là tự động quét
scheduler.add_job(func=trigger_monthly_billing, trigger="cron", day=1, hour=0, minute=5)
scheduler.start()

if __name__ == '__main__':
    # Tắt tính năng reload của Flask khi dùng Scheduler để tránh việc chạy hẹn giờ 2 lần
    app.run(host='0.0.0.0', port=5000, debug=True, use_reloader=False)