from flask import Blueprint
from app.controllers.auth_controller import login_logic
from app.controllers.auth_controller import update_user_logic, search_students_logic


auth_bp = Blueprint('auth', __name__)

auth_bp.route('/login', methods=['POST'])(login_logic)


auth_bp.route('/user/<int:user_id>', methods=['PUT'])(update_user_logic)
auth_bp.route('/search', methods=['GET'])(search_students_logic)