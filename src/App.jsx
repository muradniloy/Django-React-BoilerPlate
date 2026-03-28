import * as CM from './componentExporter';
import { useEffect, useState } from "react";

const App = () => {
    const [{ profile }, dispatch] = CM.useGlobalState();
    const [loading, setLoading] = useState(true);

    // ১. অটো-লগইন এবং সেশন ভেরিফিকেশন (HttpOnly Cookie ভিত্তিক)
    useEffect(() => {
        const fetchUser = async () => {
            try {
                // সরাসরি আপনার তৈরি করা axiosInstance ব্যবহার করুন
                // এটি অটোমেটিক withCredentials এবং baseURL হ্যান্ডেল করবে
                const response = await CM.axiosInstance.get("/api/profile/");
                
                // গ্লোবাল স্টেটে প্রোফাইল ডাটা সেট করা
                dispatch({ type: "ADD_PROFILE", profile: response.data });
                
            } catch (error) {
                // যদি সেশন ইনভ্যালিড হয় বা কুকি না থাকে (৪০১/৪০৩ এরর)
                console.error("Auth status: User is not logged in");
                
                // ফ্রন্টএন্ড স্টেট ক্লিয়ার করা
                dispatch({ type: "LOGOUT" });
                localStorage.clear();
                sessionStorage.clear();

                // যদি ইউজার আগে লগইন অবস্থায় ছিল কিন্তু এখন সেশন ফেইল করে
                if (profile) {
                    CM.Swal.fire({
                        title: 'সেশন শেষ!',
                        text: 'নিরাপত্তার স্বার্থে আপনাকে আবার লগইন করতে হবে।',
                        icon: 'info',
                        timer: 2500,
                        showConfirmButton: false,
                        toast: true,
                        position: 'top-end'
                    });
                }
            } finally {
                // সবশেষে লোডিং বন্ধ করা
                setLoading(false);
            }
        };
        fetchUser();
    }, [dispatch]);

    // ২. প্রাথমিক লোডিং স্ক্রিন (এটি প্রোটেকশন চেক শেষ না হওয়া পর্যন্ত দেখাবে)
    if (loading) return (
        <div className="d-flex flex-column justify-content-center align-items-center" style={{ height: '100vh', background: '#1a1a1a' }}>
            <div className="spinner-border text-primary" role="status" style={{ width: '3.5rem', height: '3.5rem' }}></div>
            <p className="mt-3 fw-bold text-white">নিরাপদ সংযোগ যাচাই হচ্ছে...</p>
        </div>
    );

    return (
        <CM.BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <CM.Routes>
                
                {/* 🏠 পাবলিক সেকশন */}
                <CM.Route element={<CM.MainLayout />}>
                    <CM.Route element={<CM.PublicRoute />}>
                        <CM.Route path="/" element={<CM.NcHomePage />} />
                        <CM.Route path="/login" element={<CM.Login />} />
                        <CM.Route path="/verify-invoice/:student_id/:invoice_no" element={<CM.InvoiceVerification />} />
                        <CM.Route path="/all-notices" element={<CM.AllNoticeList />} />
                        <CM.Route path="/contact_us" element={<CM.ContactPage />} />
                        <CM.Route path="/college-profile" element={<CM.CollegeProfile />} />
                        <CM.Route path="/faculty-view" element={<CM.EmployeePublicView />} />
                        <CM.Route path="/admission-query" element={<CM.AdmissionQueryForm />} />
                        <CM.Route path="/lab-photos" element={<CM.LabPhotos />} />
                        <CM.Route path="/register" element={<CM.Registration />} />
                    </CM.Route>

                    {/* ভুল URL হিট করলে হোম পেজ */}
                    <CM.Route path="*" element={<CM.NcHomePage />} />
                    
                </CM.Route>

                {/* 🛡️ প্রোটেক্টড সেকশন: ProtectedRoute এর ভেতর সব ড্যাশবোর্ড পেজ */}
                <CM.Route element={<CM.ProtectedRoute />}>
                    <CM.Route element={<CM.AdminLayout />}>
                        
                        <CM.Route path="/dashboard" element={<CM.AdminDashboard />} />
                        <CM.Route path="/profile" element={<CM.ProfilePage />} />
                        <CM.Route path="/EditProfileForm" element={<CM.EditProfileForm />} />

                        {/* 👁️ স্টুডেন্ট লিস্ট দেখার অনুমতি */}
                        <CM.Route element={<CM.AdminProtectionWrapper allowedGroups={['StudentsView', 'Admin']} />}>
                            <CM.Route path="/dashboard/students" element={<CM.StudentList />} />
                            <CM.Route path="/StudentPage" element={<CM.StudentPage />} />
                            <CM.Route path="/student_address" element={<CM.StudentAddressPage />} />
                            <CM.Route path="/education" element={<CM.StudentEducationPage />} />
                            <CM.Route path="/student_admission" element={<CM.StudentAdmissionView />} />
                            <CM.Route path="/student_payment" element={<CM.PaymentContactPage />} />
                            <CM.Route path="/student_full_view" element={<CM.StudentFullProfilePage />} />
                            <CM.Route path="/student_pay_history" element={<CM.StudentSinglePaymentHistory />} />
                        </CM.Route>
                        <CM.Route element={<CM.AdminProtectionWrapper allowedGroups={['EmployeeView', 'Admin']} />}>
                            <CM.Route path="/dashboard/employees" element={<CM.EmployeeList />} />
                        </CM.Route>
                        <CM.Route element={<CM.AdminProtectionWrapper allowedGroups={['EmployeeEdit', 'Admin']} />}>
                            <CM.Route path="/employee_add" element={<CM.EmployeeForm />} />
                            <CM.Route path="/update_employee" element={<CM.EmployeeForm />} />
                        </CM.Route>

                        {/* ✏️ স্টুডেন্ট ডাটা এডিট করার অনুমতি */}
                        <CM.Route element={<CM.AdminProtectionWrapper allowedGroups={['StudentsEdit', 'Admin']} />}>
                            <CM.Route path="/update_student" element={<CM.StudentUpdateForm />} />
                            <CM.Route path="/update_student_address" element={<CM.UpdateStudentAddressPage />} />
                            <CM.Route path="/update_student_education" element={<CM.StudentEducationUpdate />} />
                            <CM.Route path="/update_student_admission" element={<CM.StudentAdmissionPageUpdate />} />
                            <CM.Route path="/update_payment" element={<CM.PaymentContactFormPage />} />
                            <CM.Route path="/student_id_card" element={<CM.StudentIDCard />} />
                        </CM.Route>

                        {/* ➕ নতুন স্টুডেন্ট যোগ করার অনুমতি */}
                        <CM.Route element={<CM.AdminProtectionWrapper allowedGroups={['StudentsAdd', 'Admin']} />}>
                            <CM.Route path="/create_student" element={<CM.StudentUpdateForm />} />
                        </CM.Route>

                         {/* ➕ Accounting Related  */}
                        <CM.Route element={<CM.AdminProtectionWrapper allowedGroups={['AccountingAdmin', 'Admin']} />}>
                            <CM.Route path="/dashboard/accounting" element={<CM.AccountingPages />} />
                            <CM.Route path="/student_fee" element={<CM.StudentPaymentForm />} />
                            <CM.Route path="/student_fee_list" element={<CM.StudentPaymentListPage />} />
                            <CM.Route path="/account_transaction" element={<CM.AccountTransactionListPage />} />
                        </CM.Route>
                        {/* ➕ Website Related  */}
                        <CM.Route element={<CM.AdminProtectionWrapper allowedGroups={['WebAdmin', 'Admin']} />}>
                            <CM.Route path="/website/setting" element={<CM.WebsiteSetting />} />
                            <CM.Route path="/notice_category" element={<CM.CategoryList />} />
                            <CM.Route path="/add-category" element={<CM.CategoryForm />} />
                            <CM.Route path="/notice-list" element={<CM.NoticeList />} />
                            <CM.Route path="/add-notice" element={<CM.NoticeForm />} />
                            <CM.Route path="/add-important-link" element={<CM.ImportantLinkForm />} />
                            <CM.Route path="/edit-important-link" element={<CM.ImportantLinkForm />} />
                            <CM.Route path="/important-links" element={<CM.ImportantLinkList />} />
                            <CM.Route path="/sliders" element={<CM.SliderList />} />
                             
                        </CM.Route>

                        {/* 👑 শুধুমাত্র ফুল অ্যাডমিন কন্ট্রোল */}
                        <CM.Route element={<CM.AdminProtectionWrapper allowedGroups={['Admin']} />}>
                            <CM.Route path="/dashboard/settings" element={<CM.SettingPage />} />
                            <CM.Route path="/dashboard/settings/users" element={<CM.UserListPage />} />
                            <CM.Route path="/dashboard/divisions" element={<CM.DivisionList />} />
                            <CM.Route path="/dashboard/divisions/edit/:id" element={<CM.DivisionEdit />} />
                            <CM.Route path="/dashboard/districts" element={<CM.DistrictList />} />
                            <CM.Route path="/dashboard/districts/edit/:id" element={<CM.DistrictEdit />} />
                            <CM.Route path="/dashboard/upazillas" element={<CM.UpazillaList />} />
                            <CM.Route path="/dashboard/upazillas/edit/:id" element={<CM.UpazillaEdit />} />
                            <CM.Route path="/Address/Settings" element={<CM.AddressSettingPage />} />
                            <CM.Route path="/Program/Settings" element={<CM.ProgramSettingPage />} />
                            <CM.Route path="/Institution/Settings" element={<CM.InstitutionSettings />} />
                            <CM.Route path="/Programs" element={<CM.ProgramListPage />} />
                            <CM.Route path="/Programs/add" element={<CM.ProgramFormPage />} />
                            <CM.Route path="/Programs/edit/:id" element={<CM.ProgramFormPage />} />
                            <CM.Route path="/sessions" element={<CM.SessionListPage />} />
                            <CM.Route path="/sessions/add" element={<CM.SessionFormPage />} />
                            <CM.Route path="/sessions/edit/:id" element={<CM.SessionFormPage />} />
                            <CM.Route path="/religions" element={<CM.ReligionListPage />} />
                            <CM.Route path="/religions/add" element={<CM.ReligionFormPage />} />
                            <CM.Route path="/religions/edit/:id" element={<CM.ReligionFormPage />} />
                            <CM.Route path="/boards" element={<CM.BoardListPage />} />
                            <CM.Route path="/boards/add" element={<CM.BoardFormPage />} />
                            <CM.Route path="/boards/edit/:id" element={<CM.BoardFormPage />} />

                           
                            
                            <CM.Route path="/user-profile" element={<CM.UserProfileView />} />
                            <CM.Route path="/dashboard/logs" element={<CM.AuditLogPage />} />
                            

                            <CM.Route path="/Accouting/Settings" element={<CM.AccountingSettingPage />} />
                            <CM.Route path="/Account/add" element={<CM.AccountForm />} />
                            <CM.Route path="/Account/edit/:id" element={<CM.AccountForm />} />
                            <CM.Route path="/Account/list" element={<CM.AccountListPage />} />
                            <CM.Route path="/main-head/list" element={<CM.MainHeadListPage />} />
                            <CM.Route path="/main-head/add" element={<CM.MainHeadFormPage />} />
                            <CM.Route path="/main-head/edit/:id" element={<CM.MainHeadFormPage />} />
            
                            <CM.Route path="/payment-head/list" element={<CM.PaymentHeadListPage />} />
                            <CM.Route path="/payment-head/add" element={<CM.PaymentHeadFormPage />} />
                            <CM.Route path="/payment-head/edit/:id" element={<CM.PaymentHeadFormPage />} />

                            <CM.Route path="/fee-rate/list" element={<CM.FeeRateListPage />} />
                            <CM.Route path="/fee-rate/add" element={<CM.FeeRateFormPage />} />
                            <CM.Route path="/fee-rate/edit/:id" element={<CM.FeeRateFormPage />} />

                        </CM.Route>

                    </CM.Route>
                </CM.Route>

            </CM.Routes>
        </CM.BrowserRouter>
    );
}

export default App;