import os
from dotenv import load_dotenv

# Load biến môi trường từ file .env
load_dotenv()

class Config:
    # Cấu hình Database
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Cấu hình JWT cho đăng nhập
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY')