from flask import Blueprint
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

student_bp = Blueprint('student', __name__)

@student_bp.route('', methods=['GET'])
def get_students_route():
    return get_all_students_logic()

@student_bp.route('', methods=['POST'])
def create_student_route():
    return create_student_logic()


@student_bp.route('/<int:user_id>', methods=['PUT'])
def update_student_route(user_id):
    return update_student_logic(user_id)

@student_bp.route('/<int:user_id>', methods=['DELETE'])
def delete_student_route(user_id):
    return delete_student_logic(user_id)

@student_bp.route('/dashboard/<int:user_id>', methods=['GET'])
def student_dashboard_route(user_id):
    return get_student_dashboard_logic(user_id)

@student_bp.route('/request-room', methods=['POST'])
def submit_room_request_route():
    return request_room_logic()


@student_bp.route('/my-room/<int:student_id>', methods=['GET'])
def get_my_room_details_route(student_id):
    return get_my_room_details_logic(student_id)

@student_bp.route('/maintenance/<int:student_id>', methods=['GET'])
def get_maintenance_history_route(student_id):
    return get_maintenance_history_logic(student_id)

@student_bp.route('/maintenance', methods=['POST'])
def create_maintenance_request_route():
    return create_maintenance_request_logic()