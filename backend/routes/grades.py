from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from models.grade_model import Grade
from models.session_model import Session as SessionModel
from models.student_model import Student
from models.session_student_model import SessionStudent
# from schemas.student_schema import StudentResponse
from database.mysql import get_db
from models.user import User
from datetime import datetime
from typing import List
from schemas.grade_schema import GradeCreate, GradeResponse
from routes.user import get_current_user 

router = APIRouter()

# API Lấy điểm của học sinh trong một session
@router.get("/sessions/{session_id}/grades", response_model=List[GradeResponse])
def get_grades_of_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Kiểm tra quyền người dùng
    if current_user.role not in ["admin", "manager", "teacher"]:
        raise HTTPException(status_code=403, detail="Bạn không có quyền xem điểm của học sinh trong tiết học")

    # Kiểm tra sự tồn tại của session
    session = db.query(SessionModel).filter(SessionModel.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Tiết học không tồn tại")

    # Truy vấn điểm của tất cả học sinh trong session này
    grades = db.query(Grade).filter(Grade.session_id == session_id).all()

    # Kiểm tra nếu không có điểm cho session
    if not grades:
        raise HTTPException(status_code=404, detail="Không có điểm cho tiết học này")

    # Lấy danh sách học sinh trong session này
    students = (
        db.query(Student)
        .join(SessionStudent, SessionStudent.student_id == Student.id)
        .filter(SessionStudent.session_id == session_id)
        .all()
    )

    # Tạo danh sách điểm cho các học sinh
    result = []
    for student in students:
        # Kiểm tra nếu học sinh đã có điểm trong bảng Grade
        grade = next((g for g in grades if g.student_id == student.id), None)

        if not grade:
            # Nếu không có điểm, tạo một điểm mặc định
            grade = Grade(
                session_id=session_id,
                student_id=student.id,
                grade=None,
                status="Not Done",  # Mặc định là "Not Done"
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
        
        result.append(
            GradeResponse(
                id=grade.id,  # Lấy id của bản ghi điểm
                session_id=grade.session_id,
                student_id=grade.student_id,
                grade=grade.grade,
                status=grade.status,
                created_at=grade.created_at,
                updated_at=grade.updated_at,
                student_full_name=student.full_name,
                student_email=student.email  # Thêm thông tin học sinh
            )
        )
    
    return result





# API Lấy điểm của học sinh trong một session
@router.get("/sessions/{session_id}/grades/{student_id}", response_model=GradeResponse)
def get_grade_of_student_in_session(
    session_id: int,
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Kiểm tra quyền người dùng
    if current_user.role not in ["admin", "manager", "teacher"]:
        raise HTTPException(status_code=403, detail="Bạn không có quyền xem điểm của học sinh trong tiết học")

    # Kiểm tra sự tồn tại của session và học sinh
    session = db.query(SessionModel).filter(SessionModel.id == session_id).first()
    student = db.query(Student).filter(Student.id == student_id).first()

    if not session:
        raise HTTPException(status_code=404, detail="Tiết học không tồn tại")
    if not student:
        raise HTTPException(status_code=404, detail="Học sinh không tồn tại")

    # Lấy điểm của học sinh trong session này
    grade = db.query(Grade).filter(Grade.session_id == session_id, Grade.student_id == student_id).first()

    if not grade:
        raise HTTPException(status_code=404, detail="Học sinh chưa có điểm cho tiết học này")

    return grade


# API Cập nhật điểm của học sinh trong một session
@router.put("/sessions/{session_id}/grades/{student_id}", response_model=GradeResponse)
def update_grade_of_student_in_session(
    session_id: int,
    student_id: int,
    grade_data: GradeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Kiểm tra quyền người dùng
    if current_user.role not in ["admin", "manager", "teacher"]:
        raise HTTPException(status_code=403, detail="Bạn không có quyền cập nhật điểm của học sinh trong tiết học")

    # Kiểm tra sự tồn tại của session và học sinh
    session = db.query(SessionModel).filter(SessionModel.id == session_id).first()
    student = db.query(Student).filter(Student.id == student_id).first()

    if not session:
        raise HTTPException(status_code=404, detail="Tiết học không tồn tại")
    if not student:
        raise HTTPException(status_code=404, detail="Học sinh không tồn tại")

    # Kiểm tra xem học sinh đã có điểm trong session này chưa
    existing_grade = db.query(Grade).filter(Grade.session_id == session_id, Grade.student_id == student_id).first()

    if existing_grade:
        # Cập nhật điểm của học sinh trong session này
        existing_grade.grade = grade_data.grade
        existing_grade.status = grade_data.status
        existing_grade.updated_at = datetime.utcnow()
    else:
        # Tạo mới điểm cho học sinh trong session này
        new_grade = Grade(
            session_id=session_id,
            student_id=student_id,
            grade=grade_data.grade,
            status=grade_data.status
        )
        db.add(new_grade)

    db.commit()
    db.refresh(existing_grade if existing_grade else new_grade)

    return existing_grade if existing_grade else new_grade


# API Tạo điểm cho học sinh trong một session
@router.post("/sessions/{session_id}/grades", response_model=List[GradeResponse])
def create_grade_for_students_in_session(
    session_id: int,
    grade_data: List[GradeCreate],  # Giả sử bạn nhận một danh sách điểm cho nhiều học sinh
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Kiểm tra quyền truy cập
    if current_user.role not in ["admin", "manager", "teacher"]:
        raise HTTPException(status_code=403, detail="Bạn không có quyền tạo điểm cho học sinh trong tiết học")

    # Kiểm tra sự tồn tại của session
    session = db.query(SessionModel).filter(SessionModel.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Tiết học không tồn tại")

    # Lặp qua các điểm được gửi lên và thêm vào bảng Grade
    grade_responses = []  # Dùng để lưu các đối tượng GradeResponse trả về

    for data in grade_data:
        student = db.query(Student).filter(Student.id == data.student_id).first()
        if not student:
            raise HTTPException(status_code=404, detail=f"Học sinh với ID {data.student_id} không tồn tại")

        # Kiểm tra xem học sinh đã có điểm trong session này chưa
        existing_grade = db.query(Grade).filter(Grade.session_id == session_id, Grade.student_id == data.student_id).first()

        if existing_grade:
            existing_grade.grade = data.grade
            existing_grade.status = data.status
            existing_grade.updated_at = datetime.utcnow()
            db.commit()
            db.refresh(existing_grade)
            # Thêm thông tin học sinh vào GradeResponse
            grade_responses.append(
                GradeResponse(
                    id=existing_grade.id,
                    session_id=existing_grade.session_id,
                    student_id=existing_grade.student_id,
                    grade=existing_grade.grade,
                    status=existing_grade.status,
                    created_at=existing_grade.created_at,
                    updated_at=existing_grade.updated_at,
                    student_full_name=student.full_name,  # Thêm thông tin học sinh
                    student_email=student.email  # Thêm email của học sinh
                )
            )
        else:
            new_grade = Grade(
                session_id=session_id,
                student_id=data.student_id,
                grade=data.grade,
                status=data.status
            )
            db.add(new_grade)
            db.commit()
            db.refresh(new_grade)
            # Thêm thông tin học sinh vào GradeResponse
            grade_responses.append(
                GradeResponse(
                    id=new_grade.id,
                    session_id=new_grade.session_id,
                    student_id=new_grade.student_id,
                    grade=new_grade.grade,
                    status=new_grade.status,
                    created_at=new_grade.created_at,
                    updated_at=new_grade.updated_at,
                    student_full_name=student.full_name,  # Thêm thông tin học sinh
                    student_email=student.email  # Thêm email của học sinh
                )
            )

    return grade_responses  # Trả về danh sách các đối tượng GradeResponse


# API Huỷ điểm của học sinh trong một session
@router.delete("/sessions/{session_id}/grades/{student_id}", response_model=GradeResponse)
def delete_grade_of_student_in_session(
    session_id: int,
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Kiểm tra quyền người dùng
    if current_user.role not in ["admin", "manager", "teacher"]:
        raise HTTPException(status_code=403, detail="Bạn không có quyền xóa điểm của học sinh trong tiết học")

    # Kiểm tra sự tồn tại của session và học sinh
    session = db.query(SessionModel).filter(SessionModel.id == session_id).first()
    student = db.query(Student).filter(Student.id == student_id).first()

    if not session:
        raise HTTPException(status_code=404, detail="Tiết học không tồn tại")
    if not student:
        raise HTTPException(status_code=404, detail="Học sinh không tồn tại")

    # Kiểm tra xem học sinh đã có điểm trong session này chưa
    existing_grade = db.query(Grade).filter(Grade.session_id == session_id, Grade.student_id == student_id).first()

    if not existing_grade:
        raise HTTPException(status_code=404, detail="Học sinh chưa có điểm cho tiết học này")

    # Lưu trữ thông tin cần thiết để trả về sau khi xóa
    grade_to_delete = existing_grade  # Lưu bản ghi điểm trước khi xóa

    # Xóa điểm của học sinh
    db.delete(existing_grade)
    db.commit()

    # Trả về thông tin điểm học sinh đã bị xóa, bao gồm cả thông tin học sinh
    return {
        "id": grade_to_delete.id,  # Trả về id của điểm
        "session_id": grade_to_delete.session_id,
        "student_id": grade_to_delete.student_id,
        "grade": grade_to_delete.grade,
        "status": grade_to_delete.status,
        "created_at": grade_to_delete.created_at,
        "updated_at": grade_to_delete.updated_at,
        "student_full_name": student.full_name,  # Thông tin tên học sinh
        "student_email": student.email  # Thông tin email học sinh
    }



