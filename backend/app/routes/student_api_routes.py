from flask import Blueprint, request, jsonify
from app.controllers.student_api_controller import get_student_dashboard, request_room

# THÊM MỚI: Import logic quản lý sinh viên từ auth_controller
from app.controllers.auth_controller import (
    require_role, get_all_students_logic, create_student_logic,
    update_student_logic, delete_student_logic
)

student_api_bp = Blueprint('student_api', __name__)

# ==========================================
# CÁC ROUTE MỚI ĐỂ QUẢN LÝ SINH VIÊN (CRUD)
# ==========================================
@student_api_bp.route('', methods=['GET', 'POST', 'OPTIONS'], strict_slashes=False)
@require_role('admin', 'staff')
def handle_students():
    if request.method == 'OPTIONS': return jsonify({'status': 'ok'}), 200
    if request.method == 'POST': return create_student_logic()
    return get_all_students_logic()

@student_api_bp.route('/<int:student_id>', methods=['PUT', 'DELETE', 'OPTIONS'], strict_slashes=False)
@require_role('admin', 'staff')
def handle_single_student(student_id):
    if request.method == 'OPTIONS': return jsonify({'status': 'ok'}), 200
    if request.method == 'PUT': return update_student_logic(student_id)
    if request.method == 'DELETE': return delete_student_logic(student_id)

# ==========================================
# CÁC ROUTE CŨ DÀNH CHO DASHBOARD SINH VIÊN
# ==========================================
student_api_bp.route('/dashboard/<int:user_id>', methods=['GET'])(get_student_dashboard)
student_api_bp.route('/request-room', methods=['POST'])(request_room)