# 🏢 DormHub - Comprehensive Dormitory Management System

DormHub is a modern dormitory management platform built to streamline and optimize the administration of rooms, students, staff, and billing processes.

## 🚀 Technologies Used
* **Frontend:** ReactJS, Material-UI (MUI), Axios
* **Backend:** Python Flask, Flask-SQLAlchemy, Flask-JWT-Extended
* **Database:** PostgreSQL
* **Integration:** MoMo Payment Gateway (Sandbox)

## ✨ Key Features
* **Room Management:** Add, update, and delete rooms. Manage room capacity and maintenance statuses. Support for uploading and storing actual room images.
* **Student Management:** Manage student profiles, contact details, student IDs, and track digital wallet balances.
* **Staff Management:** Strict role-based access control system (Full-access Admin & Standard Staff). 
* **Security:** Secure user authentication using JWT Tokens, robust password hashing, and strict API route authorization.

## 👨‍💻 Development Team (Scrum)
* **Nguyen Nhat Hao** - Core Developer
* **Quang Minh** - Scrum Master
* **Dinh Khoi** - Database Engineer
* **Trong Nghia** - Web Designer
* **Kim Phong** - Programmer

## ⚙️ Installation Guide

### 1. Backend Setup (Flask)
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate
pip install -r requirements.txt
python3 run.py
