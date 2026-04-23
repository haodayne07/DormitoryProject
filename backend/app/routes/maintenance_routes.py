from flask import Blueprint
from app.controllers.maintenance_controller import report_issue_logic, get_all_issues_logic, update_issue_status_logic

maintenance_bp = Blueprint('maintenance', __name__)

maintenance_bp.route('/report', methods=['POST'])(report_issue_logic)
maintenance_bp.route('/list', methods=['GET'])(get_all_issues_logic)

maintenance_bp.route('/<int:issue_id>', methods=['PUT'])(update_issue_status_logic)