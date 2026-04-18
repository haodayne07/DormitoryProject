from app import create_app
from app.extensions import db
from app.models.auth_model import User
from werkzeug.security import generate_password_hash
from sqlalchemy import text

app = create_app()

with app.app_context():
    try:
        print("⏳ Đang tiến hành dọn dẹp dữ liệu cũ...")
        
        db.session.execute(text("TRUNCATE TABLE users CASCADE;"))
        db.session.commit()
        print("✅ Đã xoá sạch toàn bộ dữ liệu User cũ!")

        print("⏳ Đang tạo dữ liệu mới...")
        
        # 1. Tạo tài khoản Admin (Đã bổ sung full_name)
        admin = User(
            username='admin', 
            password=generate_password_hash('admin123'), 
            full_name='Quản trị viên', 
            email='admin@dormhub.com', 
            role='admin'
        )
        
        # 2. Tạo tài khoản Student mẫu (Đã bổ sung full_name)
        student1 = User(
            username='student1', 
            password=generate_password_hash('123456'), 
            full_name='Nguyễn Văn Sinh Viên',
            email='student1@gmail.com', 
            role='student'
        )
        
        # 3. Tạo tài khoản Staff mẫu (Đã bổ sung full_name)
        staff1 = User(
            username='staff1', 
            password=generate_password_hash('123456'), 
            full_name='Trần Nhân Viên',
            email='staff1@gmail.com', 
            role='staff'
        )

        db.session.add_all([admin, student1, staff1])
        db.session.commit()
        
        print("🎉 THÀNH CÔNG! Đã bơm lại data chuẩn gồm:")
        print("  - Admin   : admin / admin123")
        print("  - Student : student1 / 123456")
        print("  - Staff   : staff1 / 123456")
        
    except Exception as e:
        db.session.rollback()
        print(f"❌ CÓ LỖI XẢY RA: {str(e)}")