## Backend Development Status

The SUVIDHA backend is currently in active development.  
The authentication using goverment-IDs and transport security implementation have been completed.Completed HTTPS routes and TLS have been tested locally using mkcert certificates

### Completed Work

- **Authentication & Authorization**
  - OTP-based authentication system
  - JWT access and refresh token flow
  - Token-origin flag for sensitive operations

- **Route Logic**
  - Authentication service routes completed
  - Gateway-compatible routing structure

- **Cookie & Session Security**
  - JWTs issued via HttpOnly and Secure cookies
  - HTTPS-only cookie transmission enforced

- **HTTPS & TLS Implementation**
  - HTTPS enabled across backend services
  - TLS encryption for all API communication
  - Local HTTPS testing completed using mkcert
    - Custom local Certificate Authority installed
    - Trusted localhost certificates generated

### Security Highlights

- Protection against token leakage and XSS
- Enforced HTTPS to prevent man-in-the-middle attacks
- Local development mirrors production security behavior

---

## Planned Backend Features

The following features are planned and will be developed on top of the existing secure authentication foundation:

- API Gateway with centralized JWT validation
- Billing and consumption data services
- Complaint registration and tracking
- Alerts and notification service
- Secure payments and receipt generation
- Document and report retrieval
- AI microservices for:
  - Consumption analysis and anomaly detection
  - Government scheme recommendations
  - Voice chatbot integration
- Smart queue estimation and usage analytics
- Admin monitoring and reporting APIs
- Caching, monitoring, and Kubernetes-based deployment

---

## Planned API Routes

### Billing Service
- `GET /bills/list`
- `GET /bills/list?type=`
- `GET /bills/list?ID=`

### Complaints Service
- `GET /complaints/list`
- `GET /complaints/fetch`

### Alerts Service
- `GET /alerts`

### Documents Service
- `GET /docs/list`
- `GET /docs/fetch?ID=`

### Reports Service
- `GET /reports/list`
- `GET /reports/fetch?ID=`

### Payments & Receipts
- `POST /payment/initiate?ID=`
- `GET /receipts/fetch?ID=`

### AI Services
- `GET /bills/insights/type`
- `GET /schemes/recommendations`
---
 ## Conclusion

The SUVIDHA backend is being developed with a strong focus on security, scalability, and production readiness.  

Currently,the secure auth using JWT and otp,HTTPS and TLS have been completed.This ensures a secure access to the kiosk services with any goverment ID and registered phone number using OTP.
With the security part handled , now we will implement the other routes to connect with our mock databases and ai models and seamlessly deliver needed data to the frontend of the kiosk application.

This backend is being designed to try and provide a secure and easy access to goverment services via the kiosk to all citizens

