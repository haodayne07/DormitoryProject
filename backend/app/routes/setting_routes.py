from flask import Blueprint
from app.controllers.setting_controller import (
    get_settings_logic, update_dorm_config_logic,
    update_system_config_logic, update_account_logic
)

setting_bp = Blueprint('setting', __name__)

setting_bp.route('', methods=['GET'], strict_slashes=False)(get_settings_logic)
setting_bp.route('/dorm', methods=['PUT'], strict_slashes=False)(update_dorm_config_logic)
setting_bp.route('/system', methods=['PUT'], strict_slashes=False)(update_system_config_logic)
setting_bp.route('/account', methods=['PUT'], strict_slashes=False)(update_account_logic)