// --- Libraries ---
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import Cookies from "js-cookie";

// --- Global State ---
import { useGlobalState } from './state/provider'; 

// --- Config/Env ---
import { domain, userToken, header } from './env';
import axiosInstance from './state/axiosInstance'; 

// --- Layouts & Routes ---
import MainLayout from "./components/PublicPages/MainLayout";
import AdminLayout from './components/Admin/AdminPages/AdminLayout';
import PublicRoute from './routes/PublicRoute';
import ProtectedRoute from './routes/ProtectedRoute';
import AdminProtectionWrapper from './routes/AdminProtectionWrapper';

// --- Pages ---
import NcHomePage from './components/PublicPages/NcHomePage';
import Login from './components/PublicPages/Login';
import AdminDashboard from './components/Admin/AdminPages/AdminDashboard';
import ProfilePage from './components/Admin/AdminPages/ProfilePage';
import EditProfileForm from './components/Admin/AdminPages/EditProfileForm';
import SignUp from './components/Admin/Settings/SignUp';

import StudentList from './components/Admin/StudentPages/StudentList';
import StudentPage from './components/Admin/StudentPages/StudentPage';
// ✅ StudentProfile এখানে ইম্পোর্ট করুন (পাথ ঠিক আছে কি না দেখে নিন)
import StudentProfile from './components/Admin/StudentPages/StudentProfile'; 

import StudentAddressPage from './components/Admin/StudentPages/StudentAddressPage';
import StudentEducationPage from './components/Admin/StudentPages/StudentEducationPage';
import StudentUpdateForm from './components/Admin/StudentPages/StudentUpdateForm';
import UpdateStudentAddressPage from './components/Admin/StudentPages/StudentAddressPageUpdate';
import StudentEducationUpdate from './components/Admin/StudentPages/StudentEducationUpdate';
import StudentAdmissionView from './components/Admin/StudentPages/StudentAdmissionView';
import StudentAdmissionPageUpdate from './components/Admin/StudentPages/StudentAdmissionPageUpdate';
import PaymentContactPage from './components/Admin/StudentPages/PaymentContactPage';
import PaymentContactFormPage from './components/Admin/StudentPages/PaymentContactFormPage';

import StudentFullProfilePage from './components/Admin/StudentPages/StudentFullProfilePage';
import StudentIDCard from './components/Admin/StudentPages/StudentIDCard';
import SettingPage from './components/Admin/Settings/SettingPage';
import ProfileListPage from './components/Admin/Settings/ProfileListPage';
import AuditLogPage from './components/Admin/Settings/AuditLogPage';
import ProgramSettingPage from './components/Admin/Settings/Program_Settings/ProgramSettingPage';
import ProgramFormPage from './components/Admin/Settings/Program_Settings/ProgramFormPage';
import SessionFormPage from './components/Admin/Settings/Program_Settings/SessionFormPage';
import SessionListPage from './components/Admin/Settings/Program_Settings/SessionListPage';
import ReligionFormPage from './components/Admin/Settings/Program_Settings/ReligionFormPage';
import ReligionListPage from './components/Admin/Settings/Program_Settings/ReligionListPage';
import BoardFormPage from './components/Admin/Settings/Program_Settings/BoardFormPage';
import BoardListPage from './components/Admin/Settings/Program_Settings/BoardListPage';
// Address Related Settings
import DivisionEdit from './components/Admin/Settings/Address_Settings/DivisionEdit';
import DivisionList from './components/Admin/Settings/Address_Settings/DivisionList';
import DistrictEdit from './components/Admin/Settings/Address_Settings/DistrictEdit';
import DistrictList from './components/Admin/Settings/Address_Settings/DistrictList';
import UpazillaList from './components/Admin/Settings/Address_Settings/UpazillaList';
import UpazillaEdit from './components/Admin/Settings/Address_Settings/UpazillaEdit';
import AddressSettingPage from './components/Admin/Settings/Address_Settings/AddressSettingPage';
// Accounting Related
//AccountingSettingPages 
import MainHeadFormPage from './components/Admin/Settings/Accounting_Settings/MainHeadFormPage';
import MainHeadListPage from './components/Admin/Settings/Accounting_Settings/MainHeadListPage';
import AccountingSettingPage from './components/Admin/Settings/Accounting_Settings/AccountingSettingPage';
import PaymentHeadFormPage from './components/Admin/Settings/Accounting_Settings/PaymentHeadFormPage';
import PaymentHeadListPage from './components/Admin/Settings/Accounting_Settings/PaymentHeadListPage';
import FeeRateFormPage from './components/Admin/Settings/Accounting_Settings/FeeRateFormPage';
import FeeRateListPage from './components/Admin/Settings/Accounting_Settings/FeeRateListPage';
import ProgramListPage from './components/Admin/Settings/Program_Settings/ProgramListPage';
//AccountingPages
import AccountingPages from './components/Admin/AdminPages/AccountingPages/AccountingPage';
import StudentPaymentForm from './components/Admin/AdminPages/AccountingPages/StudentPaymentForm';
import StudentPaymentListPage from './components/Admin/AdminPages/AccountingPages/StudentPaymentListPage';
import InvoiceVerification from './components/Admin/AdminPages/AccountingPages/InvoiceVerification';


// --- SweetAlert Toast ---
export const toast = (title, icon = 'success') => {
    Swal.fire({
        title: title,
        icon: icon,
        timer: 1500,
        showConfirmButton: false,
        toast: true,
        position: 'top-end',
        timerProgressBar: true
    });
};

// --- Final Named Exports ---
export { 
    React, useState, useEffect, 
    BrowserRouter, Route, Routes, 
    useLocation, useNavigate,
    axios, axiosInstance, Swal, Cookies, useGlobalState, 
    domain, userToken, header,
    MainLayout, AdminLayout, PublicRoute, ProtectedRoute, AdminProtectionWrapper,
    NcHomePage, Login, AdminDashboard, ProfilePage, EditProfileForm, SignUp,
    StudentList, StudentPage, StudentProfile, // ✅ এখানে StudentProfile যোগ করা হলো
    StudentAddressPage, StudentEducationPage, 
    StudentUpdateForm, UpdateStudentAddressPage, StudentEducationUpdate,
    StudentAdmissionView, StudentAdmissionPageUpdate,
    PaymentContactPage, PaymentContactFormPage, 
    StudentFullProfilePage, StudentIDCard, 
    SettingPage, ProfileListPage, AuditLogPage, 
    ProgramSettingPage, ProgramListPage , ProgramFormPage,
    SessionFormPage, SessionListPage, ReligionFormPage, ReligionListPage,
    BoardListPage, BoardFormPage,
    AddressSettingPage,
    DivisionList, DivisionEdit, DistrictList, DistrictEdit, UpazillaList, UpazillaEdit,

    //Accounting Related Imports
    MainHeadListPage, MainHeadFormPage, AccountingSettingPage,
    PaymentHeadListPage, PaymentHeadFormPage, FeeRateFormPage, FeeRateListPage,
    AccountingPages, StudentPaymentForm, StudentPaymentListPage, InvoiceVerification
};