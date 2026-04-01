import React from 'react'
import { Link } from 'react-router-dom'
import { useGlobalState } from '../../../state/provider'
import { domain } from '../../../env'

const ProfilePage = () => {
  const [{ profile }] = useGlobalState()
  console.log(profile, 'from profile page')
  

  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        {/* Profile Card */}
        <div className="col-md-4">
          <div className="card shadow-sm text-center">
            <div className="card-body">
              <div class="d-flex justify-content-center align-items-center my-3">
              <div className="profile-img-wrapper">
                <img src={`${domain}${profile?.image}`} alt="Profile"/>
              </div>
              </div>

              <h4 className="mb-0">{profile?.prouser.first_name || 'First Name'} {profile?.prouser.last_name || 'Last Name'}</h4>
              <div className="profile-status-section mt-3">
  {/* ১. স্টুডেন্ট হলে সিম্পল এবং ক্লিন ডিজাইন */}
  {profile?.groups?.includes('Fresh_Student') ? (
    <div className="d-inline-flex align-items-center bg-light border px-3 py-2 rounded-pill shadow-sm">
      <span className="text-success me-2">●</span>
      <span className="fw-bold text-dark">Student</span>
    </div>
  ) : (
    /* ২. এমপ্লয়ি হলে প্রফেশনাল ডেজিগনেশন এবং ডিপার্টমেন্ট কার্ড */
    <div className="employee-info-box">
      {/* ডেজিগনেশন ব্যাজ */}
      <div className="d-inline-block bg-opacity-10 px-3 py-1 rounded-3 mb-2">
        <span className="text-primary fw-bold text-uppercase small" style={{ letterSpacing: '1px' }}>
          <i className="bi bi-briefcase-fill me-2"></i>
          {profile?.emp_designation || profile?.designation || 'Staff'}
        </span>
      </div>

      {/* ডিপার্টমেন্ট সেকশন */}
      {profile?.emp_department && (
        <div className="mt-1">
          <span className="text-muted small d-flex align-items-center justify-content-center">
            <i className="bi bi-building me-1"></i>
            <span className="fw-medium">Department: {profile.emp_department} </span>
          </span>
        </div>
      )}
    </div>
  )}
</div>

                <Link
                to="/EditProfileForm"
                className="btn btn-primary btn-sm px-3 mt-2"
              >
                ✏️ Edit Profile
              </Link>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="col-md-8 mt-4 mt-md-0">
          <div className="card shadow-sm mb-4">
            <div className="card-header fw-bold">Profile Information</div>
            <ul className="list-group list-group-flush">
              <li className="list-group-item">
                <strong>Email:</strong> {profile?.prouser.email || 'example@email.com'}
              </li>
               <li className="list-group-item">
                <strong>Username : </strong> {profile?.prouser.username || 'Username'}
              </li>
              <li className="list-group-item">
                <strong>Phone:</strong> {profile?.phone || '+880 1XXXXXXXXX'}
              </li>
              <li className="list-group-item">
                <strong>Location:</strong> {profile?.location || 'Bangladesh'}
              </li>
             
            </ul>
          </div>

          <div className="card shadow-sm">
            <div className="card-header fw-bold">About Me</div>
            <div className="card-body">
              <p className="mb-0">
                {profile?.about || 'Write something about yourself.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage