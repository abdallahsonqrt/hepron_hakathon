import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      brand: "Hebron Urban",
      nav: { home: "Home", submit: "Submit Complaint", login: "Login", logout: "Logout" },
      home: {
        title: "Urban Feedback System",
        city: "Hebron",
        description: "Helping improve city services through citizen feedback. Report infrastructure issues and help make Hebron a better place to live.",
        cta: "Submit a Complaint",
      },
      categories: { water: "Water", electricity: "Electricity", roads: "Roads", waste: "Waste" },
      form: {
        title: "Submit a Complaint",
        subtitle: "Fill in the details below. Only the description is required.",
        name: "Full Name",
        phone: "Phone Number",
        optional: "Optional",
        type: "Complaint Type",
        selectType: "Select type",
        description: "Description",
        location: "Location",
        locationPlaceholder: "e.g. Old City, Hebron",
        describePlaceholder: "Describe the issue…",
        submit: "Submit Complaint",
        success: "Your complaint has been submitted successfully!",
        descRequired: "Description is required.",
        other: "Other",
      },
      login: {
        welcome: "Welcome back",
        subtitle: "Sign in to your account",
        email: "Email",
        password: "Password",
        remember: "Remember me",
        signIn: "Sign In",
        fillAll: "Please fill in all fields.",
      },
    },
  },
  ar: {
    translation: {
      brand: "الخليل الحضرية",
      nav: { home: "الرئيسية", submit: "تقديم شكوى", login: "تسجيل الدخول", logout: "تسجيل الخروج" },
      home: {
        title: "نظام التغذية الراجعة الحضرية",
        city: "الخليل",
        description: "المساعدة في تحسين خدمات المدينة من خلال ملاحظات المواطنين. أبلغ عن مشاكل البنية التحتية وساعد في جعل الخليل مكانًا أفضل للعيش.",
        cta: "تقديم شكوى",
      },
      categories: { water: "المياه", electricity: "الكهرباء", roads: "الطرق", waste: "النفايات" },
      form: {
        title: "تقديم شكوى",
        subtitle: "املأ التفاصيل أدناه. الوصف فقط مطلوب.",
        name: "الاسم الكامل",
        phone: "رقم الهاتف",
        optional: "اختياري",
        type: "نوع الشكوى",
        selectType: "اختر النوع",
        description: "الوصف",
        location: "الموقع",
        locationPlaceholder: "مثال: البلدة القديمة، الخليل",
        describePlaceholder: "صف المشكلة…",
        submit: "إرسال الشكوى",
        success: "تم تقديم شكواك بنجاح!",
        descRequired: "الوصف مطلوب.",
        other: "أخرى",
      },
      login: {
        welcome: "مرحبًا بعودتك",
        subtitle: "سجّل الدخول إلى حسابك",
        email: "البريد الإلكتروني",
        password: "كلمة المرور",
        remember: "تذكرني",
        signIn: "تسجيل الدخول",
        fillAll: "يرجى ملء جميع الحقول.",
      },
    },
  },
};

const savedLang = localStorage.getItem("hebron_lang") || "en";

i18n.use(initReactI18next).init({
  resources,
  lng: savedLang,
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export default i18n;
