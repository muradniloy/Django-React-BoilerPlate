import React from 'react'
import { Link } from 'react-router-dom'
import { useGlobalState } from '../state/provider'
import { domain } from '../env'

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
              <p className="text-muted">{profile?.designation || 'Web Developer'}</p>

                <Link
                to="/EditProfileForm"
                className="btn btn-primary btn-sm px-3"
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