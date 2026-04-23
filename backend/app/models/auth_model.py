# Gộp chung vào user_model.py để tránh lỗi trùng lặp (Duplicate Table)
# Import lại ở đây để các file controller khác gọi đến auth_model vẫn hoạt động bình thường
from .user_model import User, ROLE_STUDENT, ROLE_ADMIN, ROLE_STAFF