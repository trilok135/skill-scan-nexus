# Python Backend API Documentation
## Applicant Tracking System

### Base URL
```
https://your-api-domain.com/api/v1
```

### Authentication
All endpoints require Bearer token authentication:
```
Authorization: Bearer <jwt_token>
```

## 1. Authentication Endpoints

### POST /auth/login
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
**Response:**
```json
{
  "access_token": "jwt_token_here",
  "refresh_token": "refresh_token_here",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "recruiter"
  }
}
```

### POST /auth/refresh
```json
{
  "refresh_token": "refresh_token_here"
}
```

## 2. Candidates/Applicants Endpoints

### GET /candidates
**Query Parameters:**
- `page`: int (default: 1)
- `limit`: int (default: 20)
- `status`: string (applied, screening, interview, hired, rejected)
- `position`: string
- `search`: string

**Response:**
```json
{
  "candidates": [
    {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "position": "Frontend Developer",
      "status": "applied",
      "experience": "3-5 years",
      "skills": ["React", "TypeScript", "Node.js"],
      "location": "New York, NY",
      "applied_at": "2024-01-15T10:30:00Z",
      "resume_url": "https://storage.com/resumes/john-doe.pdf",
      "score": {
        "overall": 85,
        "authenticity": 92,
        "completeness": 78,
        "rating": 4.2
      },
      "avatar": "https://storage.com/avatars/john.jpg"
    }
  ],
  "total": 150,
  "page": 1,
  "total_pages": 8
}
```

### GET /candidates/{id}
**Response:**
```json
{
  "id": "uuid",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "position": "Frontend Developer",
  "status": "applied",
  "experience": "3-5 years",
  "skills": ["React", "TypeScript", "Node.js"],
  "location": "New York, NY",
  "applied_at": "2024-01-15T10:30:00Z",
  "resume_url": "https://storage.com/resumes/john-doe.pdf",
  "score": {
    "overall": 85,
    "authenticity": 92,
    "completeness": 78,
    "rating": 4.2,
    "technical_skills": 88,
    "experience_match": 82,
    "education": 75,
    "flags": ["missing_cover_letter"]
  },
  "ai_suggestions": [
    {
      "category": "Technical Skills",
      "suggestion": "Consider adding more specific examples of React projects",
      "priority": "high",
      "resources": ["https://reactjs.org/docs"]
    }
  ],
  "interview_history": [],
  "notes": []
}
```

### PUT /candidates/{id}/status
```json
{
  "status": "interview",
  "notes": "Moving to technical interview round"
}
```

## 3. File Upload & Processing Endpoints

### POST /files/upload
**Content-Type:** `multipart/form-data`
```
file: <resume_file>
candidate_id: uuid (optional)
```

**Response:**
```json
{
  "file_id": "uuid",
  "file_url": "https://storage.com/files/resume.pdf",
  "status": "processing",
  "upload_time": "2024-01-15T10:30:00Z"
}
```

### GET /files/{file_id}/analysis
**Response:**
```json
{
  "file_id": "uuid",
  "analysis": {
    "overall_score": 85,
    "authenticity": 92,
    "completeness": 78,
    "rating": 4.2,
    "technical_skills": 88,
    "experience_match": 82,
    "education": 75,
    "extracted_data": {
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "skills": ["React", "TypeScript", "Node.js"],
      "experience": "3-5 years",
      "education": "BS Computer Science"
    },
    "flags": ["missing_cover_letter"],
    "suggestions": [
      {
        "category": "Technical Skills",
        "suggestion": "Add more specific project examples",
        "priority": "high"
      }
    ]
  },
  "status": "completed",
  "processed_at": "2024-01-15T10:35:00Z"
}
```

## 4. Dashboard & Analytics Endpoints

### GET /dashboard/stats
**Response:**
```json
{
  "total_applicants": 1247,
  "new_this_week": 23,
  "interviews_scheduled": 8,
  "positions_open": 12,
  "hiring_funnel": [
    {
      "stage": "Applied",
      "count": 150,
      "percentage": 100
    },
    {
      "stage": "Screening",
      "count": 89,
      "percentage": 59
    },
    {
      "stage": "Interview",
      "count": 45,
      "percentage": 30
    },
    {
      "stage": "Offer",
      "count": 12,
      "percentage": 8
    },
    {
      "stage": "Hired",
      "count": 8,
      "percentage": 5
    }
  ]
}
```

### GET /dashboard/recent-activity
**Query Parameters:**
- `limit`: int (default: 10)

**Response:**
```json
{
  "activities": [
    {
      "id": "uuid",
      "type": "new_application",
      "message": "New application from John Doe for Frontend Developer",
      "timestamp": "2024-01-15T10:30:00Z",
      "urgent": false,
      "candidate_id": "uuid",
      "candidate_name": "John Doe"
    }
  ]
}
```

## 5. Jobs Endpoints

### GET /jobs
**Response:**
```json
{
  "jobs": [
    {
      "id": "uuid",
      "title": "Frontend Developer",
      "department": "Engineering",
      "location": "New York, NY",
      "type": "full-time",
      "status": "active",
      "applications_count": 45,
      "created_at": "2024-01-10T09:00:00Z",
      "description": "We are looking for a skilled Frontend Developer..."
    }
  ]
}
```

### POST /jobs
```json
{
  "title": "Frontend Developer",
  "department": "Engineering",
  "location": "New York, NY",
  "type": "full-time",
  "description": "Job description here...",
  "requirements": ["3+ years React experience"],
  "salary_range": {
    "min": 80000,
    "max": 120000
  }
}
```

## 6. Interviews Endpoints

### GET /interviews
**Query Parameters:**
- `date_from`: ISO date
- `date_to`: ISO date
- `status`: scheduled, completed, cancelled

**Response:**
```json
{
  "interviews": [
    {
      "id": "uuid",
      "candidate_id": "uuid",
      "candidate_name": "John Doe",
      "position": "Frontend Developer",
      "interviewer": "Jane Smith",
      "scheduled_at": "2024-01-20T14:00:00Z",
      "duration": 60,
      "type": "technical",
      "status": "scheduled",
      "notes": ""
    }
  ]
}
```

### POST /interviews
```json
{
  "candidate_id": "uuid",
  "interviewer_id": "uuid",
  "scheduled_at": "2024-01-20T14:00:00Z",
  "duration": 60,
  "type": "technical",
  "notes": "Technical round focusing on React"
}
```

## 7. AI Suggestions Endpoint

### GET /candidates/{id}/ai-suggestions
**Response:**
```json
{
  "suggestions": [
    {
      "category": "Technical Skills",
      "title": "Enhance React Expertise",
      "description": "Based on your current experience, consider deepening your React knowledge",
      "actionable_steps": [
        "Complete advanced React patterns course",
        "Build a complex state management project",
        "Learn React Testing Library"
      ],
      "resources": [
        {
          "title": "Advanced React Patterns",
          "url": "https://example.com/react-course",
          "type": "course"
        }
      ],
      "priority": "high",
      "estimated_time": "2-3 weeks"
    }
  ]
}
```

## 8. Reports Endpoints

### GET /reports/hiring-metrics
**Query Parameters:**
- `date_from`: ISO date
- `date_to`: ISO date
- `department`: string

**Response:**
```json
{
  "metrics": {
    "total_applications": 245,
    "total_hires": 12,
    "time_to_hire_avg": 21,
    "conversion_rate": 4.9,
    "source_breakdown": [
      {
        "source": "LinkedIn",
        "applications": 89,
        "percentage": 36.3
      }
    ]
  }
}
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "email": ["This field is required"]
    }
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `422`: Validation Error
- `500`: Internal Server Error

## File Upload Specifications
- **Supported formats**: PDF, DOC, DOCX
- **Max file size**: 10MB
- **File processing**: Asynchronous with status polling
- **Storage**: Secure cloud storage with signed URLs

## WebSocket Events (Optional)
For real-time updates:
- `new_application`: New candidate applied
- `status_update`: Candidate status changed
- `interview_scheduled`: New interview scheduled
- `file_processed`: Resume analysis completed