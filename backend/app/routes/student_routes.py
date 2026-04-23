from flask import Blueprint, request, jsonify
from app.controllers.student_controller import (
    get_all_students_logic, 
    create_student_logic, 
    update_student_logic, 
    delete_student_logic,
    get_student_dashboard_logic,
    request_room_logic, 
    get_my_room_details_logic, 
    get_maintenance_history_logic, 
    create_maintenance_request_logic 
)
from app.controllers.auth_controller import require_role # Import tính năng phân quyền

student_bp = Blueprint('student', __name__)

# ==========================================
# 🛡️ API DÀNH CHO ADMIN / STAFF
# ==========================================

@student_bp.route('', methods=['GET', 'OPTIONS'], strict_slashes=False)
@require_role('admin', 'staff')
def get_students_route():
    if request.method == 'OPTIONS': return jsonify({'status': 'ok'}), 200
    return get_all_students_logic()

@student_bp.route('', methods=['POST', 'OPTIONS'], strict_slashes=False)
@require_role('admin', 'staff')
def create_student_route():
    if request.method == 'OPTIONS': return jsonify({'status': 'ok'}), 200
    return create_student_logic()

@student_bp.route('/<int:user_id>', methods=['PUT', 'OPTIONS'], strict_slashes=False)
@require_role('admin', 'staff')
def update_student_route(user_id):
    if request.method == 'OPTIONS': return jsonify({'status': 'ok'}), 200
    return update_student_logic(user_id)

@student_bp.route('/<int:user_id>', methods=['DELETE', 'OPTIONS'], strict_slashes=False)
@require_role('admin', 'staff')
def delete_student_route(user_id):
    if request.method == 'OPTIONS': return jsonify({'status': 'ok'}), 200
    return delete_student_logic(user_id)


# ==========================================
# 🎓 API DÀNH CHO STUDENT (Đã fix lỗi 404 OPTIONS)
# ==========================================

@student_bp.route('/dashboard/<int:user_id>', methods=['GET', 'OPTIONS'], strict_slashes=False)
def student_dashboard_route(user_id):
    if request.method == 'OPTIONS': return jsonify({'status': 'ok'}), 200
    return get_student_dashboard_logic(user_id)

@student_bp.route('/request-room', methods=['POST', 'OPTIONS'], strict_slashes=False)
def submit_room_request_route():
    if request.method == 'OPTIONS': return jsonify({'status': 'ok'}), 200
    return request_room_logic()

@student_bp.route('/my-room/<int:student_id>', methods=['GET', 'OPTIONS'], strict_slashes=False)
def get_my_room_details_route(student_id):
    if request.method == 'OPTIONS': return jsonify({'status': 'ok'}), 200
    return get_my_room_details_logic(student_id)

@student_bp.route('/maintenance/<int:student_id>', methods=['GET', 'OPTIONS'], strict_slashes=False)
def get_maintenance_history_route(student_id):
    if request.method == 'OPTIONS': return jsonify({'status': 'ok'}), 200
    return get_maintenance_history_logic(student_id)

@student_bp.route('/maintenance', methods=['POST', 'OPTIONS'], strict_slashes=False)
def create_maintenance_request_route():
    if request.method == 'OPTIONS': return jsonify({'status': 'ok'}), 200
    return create_maintenance_request_logic()