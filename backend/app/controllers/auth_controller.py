from flask import request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, get_jwt, verify_jwt_in_request
from functools import wraps 
from app.models.auth_model import User 
from app.extensions import db

# ==========================================
# ANH BẢO VỆ (ĐÃ CẤP PHÉP CHO OPTIONS)
# ==========================================
def require_role(*allowed_roles):
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            # Nếu trình duyệt gửi OPTIONS thăm dò, cho qua luôn với mã 200
            if request.method == 'OPTIONS':
                return jsonify({'status': 'ok'}), 200

            try:
                verify_jwt_in_request()
                claims = get_jwt()
                user_role = claims.get("role")
                
                if user_role not in allowed_roles and user_role != 'admin':
                    return jsonify({"error": "Bạn không có quyền thực hiện hành động này!"}), 403
            except Exception as e:
                return jsonify({"error": "Token không hợp lệ hoặc đã hết hạn"}), 401
            
            return fn(*args, **kwargs)
        return decorator
    return wrapper

# ... (Bạn copy các hàm login_logic, update_user_logic, search_students_logic, get_all_staff_logic, create_staff_logic, update_staff_logic, delete_staff_logic CỦA BẠN DÁN TIẾP VÀO DƯỚI NÀY NHÉ) ...

def login_logic():
    data = request.get_json()
    user = User.query.filter_by(username=data.get('username')).first()
    
    if user and check_password_hash(user.password, data.get('password')):
        additional_claims = {"role": user.role}
        token = create_access_token(identity=str(user.user_id), additional_claims=additional_claims)
        
        return jsonify({
            'token': token, 
            'role': user.role,
            'user_id': user.user_id,
            'username': user.username
        }), 200
        
    return jsonify({'message': 'Sai tài khoản hoặc mật khẩu!'}), 401

def update_user_logic(user_id):
    data = request.get_json()
    user = User.query.get_or_404(user_id)
    
    user.full_name = data.get('full_name', getattr(user, 'full_name', ''))
    user.phone = data.get('phone', getattr(user, 'phone', ''))
    user.email = data.get('email', user.email)
    
    if data.get('password'):
        user.password = generate_password_hash(data['password'])
        
    db.session.commit()
    return jsonify({'message': 'Cập nhật thông tin thành công!'}), 200

def search_students_logic():
    query_param = request.args.get('q', '')
    students = User.query.filter(
        (User.role == 'student') & 
        ((getattr(User, 'full_name', User.username).ilike(f'%{query_param}%')) | (User.username.ilike(f'%{query_param}%')))
    ).all()
    
    return jsonify([{
        'id': s.user_id,
        'full_name': getattr(s, 'full_name', s.username),
        'username': s.username,
        'phone': getattr(s, 'phone', '')
    } for s in students]), 200

def get_all_staff_logic():
    staff_members = User.query.filter(User.role.in_(['admin', 'staff'])).all()
    return jsonify([{
        'user_id': s.user_id,
        'username': s.username,
        'email': s.email,
        'role': s.role,
        'full_name': getattr(s, 'full_name', ''),
        'phone': getattr(s, 'phone', '')
    } for s in staff_members]), 200

def create_staff_logic():
    try:
        data = request.get_json()
        if User.query.filter_by(username=data.get('username')).first():
            return jsonify({'error': 'Tên đăng nhập đã tồn tại!'}), 400
        if User.query.filter_by(email=data.get('email')).first():
            return jsonify({'error': 'Email đã tồn tại!'}), 400

        new_staff = User(
            username=data['username'],
            password=generate_password_hash(data['password']),
            email=data['email'],
            role=data.get('role', 'staff')
        )
        
        if 'full_name' in data and hasattr(new_staff, 'full_name'):
            new_staff.full_name = data['full_name']
        if 'phone' in data and hasattr(new_staff, 'phone'):
            new_staff.phone = data['phone']

        db.session.add(new_staff)
        db.session.commit()
        return jsonify({'message': f"Tạo tài khoản thành công!"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

def update_staff_logic(staff_id):
    try:
        data = request.get_json()
        staff = User.query.get_or_404(staff_id)
        
        if staff.role == 'admin' and data.get('role') != 'admin':
            return jsonify({'error': 'Không thể thay đổi quyền của Admin tối cao!'}), 400

        staff.email = data.get('email', staff.email)
        staff.role = data.get('role', staff.role)
        
        if hasattr(staff, 'full_name'):
            staff.full_name = data.get('full_name', staff.full_name)
        if hasattr(staff, 'phone'):
            staff.phone = data.get('phone', staff.phone)

        db.session.commit()
        return jsonify({'message': 'Cập nhật nhân sự thành công!'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

def delete_staff_logic(staff_id):
    try:
        staff = User.query.get_or_404(staff_id)
        if staff.role == 'admin':
            return jsonify({'error': 'Không thể xóa tài khoản Admin tối cao!'}), 400
            
        db.session.delete(staff)
        db.session.commit()
        return jsonify({'message': 'Xóa nhân sự thành công!'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
    # ... (Giữ nguyên các đoạn code cũ từ đầu đến hàm delete_staff_logic) ...

# ==========================================
# THÊM MỚI: API QUẢN LÝ SINH VIÊN (DÀNH CHO ADMIN/STAFF)
# ==========================================
def get_all_students_logic():
    students = User.query.filter_by(role='student').all()
    return jsonify([{
        'user_id': s.user_id,
        'username': s.username,
        'email': s.email,
        'full_name': getattr(s, 'full_name', ''),
        'phone': getattr(s, 'phone', ''),
        'student_code': getattr(s, 'student_code', ''),
        'balance': s.balance,
        'room': 'Chưa xếp' # (Sẽ kết nối với bảng Hợp đồng sau)
    } for s in students]), 200

def create_student_logic():
    try:
        data = request.get_json()
        if User.query.filter_by(username=data.get('username')).first():
            return jsonify({'error': 'Tên đăng nhập đã tồn tại!'}), 400
        if User.query.filter_by(email=data.get('email')).first():
            return jsonify({'error': 'Email đã tồn tại!'}), 400
        if data.get('student_code') and User.query.filter_by(student_code=data.get('student_code')).first():
            return jsonify({'error': 'Mã sinh viên này đã tồn tại!'}), 400

        new_student = User(
            username=data['username'],
            password=generate_password_hash(data['password']),
            email=data['email'],
            role='student',
            full_name=data.get('full_name', ''),
            phone=data.get('phone', ''),
            student_code=data.get('student_code', '')
        )
        db.session.add(new_student)
        db.session.commit()
        return jsonify({'message': f"Tạo hồ sơ sinh viên thành công!"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

def update_student_logic(student_id):
    try:
        data = request.get_json()
        student = User.query.get_or_404(student_id)
        
        # Kiểm tra trùng lặp email và MSSV nếu có thay đổi
        if 'email' in data and data['email'] != student.email:
            if User.query.filter_by(email=data['email']).first():
                return jsonify({'error': 'Email đã được sử dụng!'}), 400
        if 'student_code' in data and data['student_code'] and data['student_code'] != getattr(student, 'student_code', ''):
            if User.query.filter_by(student_code=data['student_code']).first():
                return jsonify({'error': 'Mã sinh viên đã được sử dụng!'}), 400

        student.email = data.get('email', student.email)
        student.full_name = data.get('full_name', getattr(student, 'full_name', ''))
        student.phone = data.get('phone', getattr(student, 'phone', ''))
        student.student_code = data.get('student_code', getattr(student, 'student_code', ''))

        db.session.commit()
        return jsonify({'message': 'Cập nhật sinh viên thành công!'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

def delete_student_logic(student_id):
    try:
        student = User.query.get_or_404(student_id)
        db.session.delete(student)
        db.session.commit()
        return jsonify({'message': 'Xóa sinh viên thành công!'}), 200
    except Exception as e:
        db.session.rollback()
        error_msg = str(e)
        
        # BẮT LỖI KHÓA NGOẠI VÀ CHUYỂN THÀNH THÔNG BÁO TIẾNG VIỆT
        if "ForeignKeyViolation" in error_msg or "violates foreign key constraint" in error_msg:
            return jsonify({
                'error': 'Không thể xóa! Sinh viên này đang có Hợp đồng, Yêu cầu thuê phòng hoặc Lịch sử thanh toán. Vui lòng xóa các dữ liệu liên quan trước khi xóa hồ sơ sinh viên!'
            }), 400
            
        return jsonify({'error': error_msg}), 500