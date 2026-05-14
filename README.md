# SLOT EASY - ENT Hospital Appointment Booking System

A modern, professional appointment booking website for SLOT EASY ENT Hospital built with HTML, CSS, JavaScript, Express.js, and Supabase.

## 🎯 Features

- **Easy Appointment Booking**: Simple 30-second booking process
- **Real-time Confirmations**: Instant email confirmation via Resend API
- **Admin Dashboard**: Manage appointments and view statistics
- **AI Chatbot**: AI-powered assistant for patient queries
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Secure Authentication**: Protected admin panel with Supabase
- **Professional UI**: Modern gradient design with smooth animations

## 🏥 Services Offered

- 👂 Ear Checkup - ₹700
- 👃 Nose Allergy Care - ₹900
- 🗣️ Throat Consultation - ₹750
- 🩺 Full ENT Assessment - ₹1,200
- 🔊 Hearing Test - ₹800

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js, Express.js
- **Database**: Supabase (PostgreSQL)
- **API**: RESTful API
- **Email**: Resend API
- **AI**: Google Gemini API
- **Deployment**: Netlify

## 📁 Project Structure

```
slot-easy-frontend/
├── index.html              # Home page with services
├── booking.html            # Appointment booking form
├── confirmation.html       # Booking confirmation page
├── dashboard.html          # Admin dashboard
├── login.html              # Admin login
├── styles.css              # Global styling (modern design)
├── script.js               # Main JavaScript logic
├── server.js               # Express backend server
├── package.json            # Dependencies
├── supabase/               # Supabase functions
│   └── functions/
│       └── send-booking-confirmation/
└── README.md              # This file
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/slot-easy-frontend.git
cd slot-easy-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
RESEND_API_KEY=your_resend_api_key
GEMINI_API_KEY=your_gemini_api_key
```

4. Start the backend server:
```bash
npm start
```

5. Serve the frontend (in another terminal):
```bash
npx http-server -p 5500
```

6. Open your browser:
```
http://localhost:5500
```

## 📋 Pages

### Public Pages
- **index.html** - Landing page with services and testimonials
- **booking.html** - Appointment booking form
- **confirmation.html** - Booking confirmation
- **login.html** - Admin login

### Admin Pages
- **dashboard.html** - Appointment management dashboard

## 🔑 Admin Credentials

Contact the administrator for login credentials.

## 📧 Email Notifications

Appointments are confirmed via email using the Resend API. Patients receive:
- Booking confirmation
- Hospital details
- Appointment timing
- Important notes and policies

## 💬 AI Chatbot

The chatbot uses Google Gemini API to answer patient queries about:
- Services and pricing
- Hospital timings
- Appointment procedures
- ENT health tips

## 🔐 Security Features

- CORS enabled for secure API communication
- Environment variables for sensitive data
- Supabase authentication for admin access
- Data validation on both frontend and backend

## 🌐 Hospital Information

**SLOT EASY ENT Hospital**
- 📍 Location: Hyderabad, Telangana
- 📞 Phone: +91 98765 43210
- 📧 Email: support@sloteasy.in
- ⏰ Timings: Monday to Saturday, 9:00 AM to 6:00 PM
- 🔄 Cancellation Policy: Free cancellation up to 24 hours before appointment

## 🎨 Design Features

- **Modern Gradient Design**: Teal and orange color scheme
- **Smooth Animations**: Professional transitions and hover effects
- **Responsive Layout**: Mobile-first approach
- **Accessibility**: Clear contrast and readable text
- **Professional UI**: Premium SaaS-quality design

## 🚀 Deployment

### Deploy to Netlify

1. Push code to GitHub
2. Go to netlify.com
3. Click Add New Site
4. Connect GitHub repository
5. Set build command as empty
6. Set publish directory as .
7. Add environment variables:
   - RESEND_API_KEY
   - GEMINI_API_KEY
   - SUPABASE_URL
   - SUPABASE_KEY
8. Click Deploy
9. Site goes live automatically!

Live URL: https://slot-easy.netlify.app

## 📄 License

MIT License - see LICENSE file for details

## 👥 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For support, email support@sloteasy.in or contact the development team.

## 🙏 Acknowledgments

- Express.js for the backend framework
- Supabase for database and authentication
- Resend for email delivery
- Google Gemini for AI capabilities
- Netlify for hosting

---

**Made with ❤️ for SLOT EASY ENT Hospital**
