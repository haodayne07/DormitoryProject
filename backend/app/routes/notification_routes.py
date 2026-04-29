from flask import Blueprint

from app.controllers.notification_controller import get_notifications_logic


notification_bp = Blueprint('notification', __name__)

notification_bp.route('', methods=['GET'], strict_slashes=False)(get_notifications_logic)
