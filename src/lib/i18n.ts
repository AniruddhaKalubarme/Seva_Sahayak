export type Language = 'en' | 'hi' | 'mr';

export const translations = {
  en: {
    // App
    appName: 'Seva Sahayak',
    appTagline: 'AI-Powered Form Filling Assistant',
    appDescription: 'Auto-fill government forms using your ID documents. Fast, secure, and accurate.',
    
    // Navigation
    dashboard: 'Dashboard',
    upload: 'Upload Documents',
    fillForm: 'Fill Form',
    review: 'Review & Export',
    
    // Steps
    step1: 'Upload',
    step2: 'Extract',
    step3: 'Fill',
    step4: 'Export',
    
    // Upload Section
    uploadTitle: 'Upload Your Documents',
    uploadDescription: 'Upload Aadhaar, PAN Card, Voter ID, or other government-issued documents',
    dragDrop: 'Drag and drop files here',
    or: 'or',
    browseFiles: 'Browse Files',
    supportedFormats: 'Supported formats: PDF, JPG, PNG (Max 10MB)',
    
    // Document Types
    aadhaar: 'Aadhaar Card',
    panCard: 'PAN Card',
    voterId: 'Voter ID',
    passport: 'Passport',
    drivingLicense: 'Driving License',
    
    // Processing
    processing: 'Processing...',
    extracting: 'Extracting information...',
    analyzing: 'Analyzing document...',
    completed: 'Completed',
    
    // Extracted Data
    extractedData: 'Extracted Information',
    name: 'Full Name',
    fatherName: "Father's Name",
    dateOfBirth: 'Date of Birth',
    gender: 'Gender',
    address: 'Address',
    pincode: 'PIN Code',
    state: 'State',
    district: 'District',
    idNumber: 'ID Number',
    aadhaarNumber: 'Aadhaar Number',
    panNumber: 'PAN Number',
    voterIdNumber: 'Voter ID Number',
    drivingLicenseNumber: 'Driving License Number',
    
    // Form
    smartForm: 'Smart Form',
    formDescription: 'Review and edit the auto-filled information',
    personalDetails: 'Personal Details',
    addressDetails: 'Address Details',
    documentDetails: 'Document Details',
    
    // Gender options
    male: 'Male',
    female: 'Female',
    other: 'Other',
    
    // Actions
    submit: 'Submit',
    save: 'Save',
    download: 'Download PDF',
    downloadForm: 'Download Form',
    edit: 'Edit',
    clear: 'Clear',
    reset: 'Reset',
    next: 'Next',
    previous: 'Previous',
    cancel: 'Cancel',
    copy: 'Copy',
    copied: 'Copied!',
    copyAll: 'Copy All',
    copyForForms: 'Copy for Other Forms',
    copyPersonal: 'Personal Details',
    copyAddress: 'Address',
    copyIds: 'ID Numbers',
    copyEverything: 'Everything',
    confirm: 'Confirm',
    
    // Voice
    voiceInput: 'Voice Input',
    speakNow: 'Speak now...',
    listening: 'Listening...',
    tapToSpeak: 'Tap to speak',
    
    // Review
    reviewTitle: 'Review Your Information',
    reviewDescription: 'Compare extracted data with your original document',
    originalDocument: 'Original Document',
    extractedInfo: 'Extracted Information',
    sideBySize: 'Side by Side View',
    
    // Messages
    uploadSuccess: 'Document uploaded successfully!',
    extractionComplete: 'Data extraction complete!',
    formSaved: 'Form saved successfully!',
    downloadReady: 'Your PDF is ready for download',
    
    // Errors
    uploadError: 'Error uploading document',
    extractionError: 'Error extracting data',
    invalidFormat: 'Invalid file format',
    fileTooLarge: 'File size exceeds 10MB',
    
    // Language
    language: 'Language',
    english: 'English',
    hindi: 'हिंदी',
    
    // Footer
    poweredBy: 'Powered by AI',
    secureProcessing: 'Secure & Private Processing',
    copyright: '',
  },
  hi: {
    // App
    appName: 'सेवा सहायक',
    appTagline: 'AI-संचालित फॉर्म भरने का सहायक',
    appDescription: 'अपने पहचान दस्तावेजों का उपयोग करके सरकारी फॉर्म स्वचालित रूप से भरें। तेज़, सुरक्षित और सटीक।',
    
    // Navigation
    dashboard: 'डैशबोर्ड',
    upload: 'दस्तावेज़ अपलोड करें',
    fillForm: 'फॉर्म भरें',
    review: 'समीक्षा और निर्यात',
    
    // Steps
    step1: 'अपलोड',
    step2: 'निकालें',
    step3: 'भरें',
    step4: 'निर्यात',
    
    // Upload Section
    uploadTitle: 'अपने दस्तावेज़ अपलोड करें',
    uploadDescription: 'आधार, पैन कार्ड, वोटर आईडी, या अन्य सरकारी दस्तावेज़ अपलोड करें',
    dragDrop: 'फ़ाइलें यहाँ खींचें और छोड़ें',
    or: 'या',
    browseFiles: 'फ़ाइलें ब्राउज़ करें',
    supportedFormats: 'समर्थित प्रारूप: PDF, JPG, PNG (अधिकतम 10MB)',
    
    // Document Types
    aadhaar: 'आधार कार्ड',
    panCard: 'पैन कार्ड',
    voterId: 'वोटर आईडी',
    passport: 'पासपोर्ट',
    drivingLicense: 'ड्राइविंग लाइसेंस',
    
    // Processing
    processing: 'प्रोसेसिंग...',
    extracting: 'जानकारी निकाल रहे हैं...',
    analyzing: 'दस्तावेज़ का विश्लेषण कर रहे हैं...',
    completed: 'पूर्ण',
    
    // Extracted Data
    extractedData: 'निकाली गई जानकारी',
    name: 'पूरा नाम',
    fatherName: 'पिता का नाम',
    dateOfBirth: 'जन्म तिथि',
    gender: 'लिंग',
    address: 'पता',
    pincode: 'पिन कोड',
    state: 'राज्य',
    district: 'जिला',
    idNumber: 'आईडी नंबर',
    aadhaarNumber: 'आधार नंबर',
    panNumber: 'पैन नंबर',
    voterIdNumber: 'वोटर आईडी नंबर',
    drivingLicenseNumber: 'ड्राइविंग लाइसेंस नंबर',
    
    // Form
    smartForm: 'स्मार्ट फॉर्म',
    formDescription: 'स्वचालित रूप से भरी गई जानकारी की समीक्षा करें और संपादित करें',
    personalDetails: 'व्यक्तिगत विवरण',
    addressDetails: 'पता विवरण',
    documentDetails: 'दस्तावेज़ विवरण',
    
    // Gender options
    male: 'पुरुष',
    female: 'महिला',
    other: 'अन्य',
    
    // Actions
    submit: 'जमा करें',
    save: 'सहेजें',
    download: 'PDF डाउनलोड करें',
    downloadForm: 'फॉर्म डाउनलोड करें',
    edit: 'संपादित करें',
    clear: 'साफ़ करें',
    reset: 'रीसेट',
    next: 'अगला',
    previous: 'पिछला',
    cancel: 'रद्द करें',
    confirm: 'पुष्टि करें',
    copy: 'कॉपी',
    copied: 'कॉपी हो गया!',
    copyAll: 'सब कॉपी करें',
    copyForForms: 'अन्य फॉर्म के लिए कॉपी करें',
    copyPersonal: 'व्यक्तिगत विवरण',
    copyAddress: 'पता',
    copyIds: 'आईडी नंबर',
    copyEverything: 'सब कुछ',
    
    // Voice
    voiceInput: 'आवाज़ इनपुट',
    speakNow: 'अब बोलें...',
    listening: 'सुन रहे हैं...',
    tapToSpeak: 'बोलने के लिए टैप करें',
    
    // Review
    reviewTitle: 'अपनी जानकारी की समीक्षा करें',
    reviewDescription: 'निकाले गए डेटा की अपने मूल दस्तावेज़ से तुलना करें',
    originalDocument: 'मूल दस्तावेज़',
    extractedInfo: 'निकाली गई जानकारी',
    sideBySize: 'साथ-साथ दृश्य',
    
    // Messages
    uploadSuccess: 'दस्तावेज़ सफलतापूर्वक अपलोड हुआ!',
    extractionComplete: 'डेटा निष्कर्षण पूर्ण!',
    formSaved: 'फॉर्म सफलतापूर्वक सहेजा गया!',
    downloadReady: 'आपका PDF डाउनलोड के लिए तैयार है',
    
    // Errors
    uploadError: 'दस्तावेज़ अपलोड करने में त्रुटि',
    extractionError: 'डेटा निकालने में त्रुटि',
    invalidFormat: 'अमान्य फ़ाइल प्रारूप',
    fileTooLarge: 'फ़ाइल का आकार 10MB से अधिक है',
    
    // Language
    language: 'भाषा',
    english: 'English',
    hindi: 'हिंदी',
    
    // Footer
    poweredBy: 'AI द्वारा संचालित',
    secureProcessing: 'सुरक्षित और निजी प्रोसेसिंग',
    copyright: '',
  },
  mr: {
    // App
    appName: 'सेवा सहायक',
    appTagline: 'AI-संचालित फॉर्म भरण्याचा सहाय्यक',
    appDescription: 'तुमच्या ओळखपत्रांचा वापर करून सरकारी फॉर्म स्वयंचलितपणे भरा. जलद, सुरक्षित आणि अचूक.',
    
    // Navigation
    dashboard: 'डॅशबोर्ड',
    upload: 'कागदपत्रे अपलोड करा',
    fillForm: 'फॉर्म भरा',
    review: 'पुनरावलोकन आणि निर्यात',
    
    // Steps
    step1: 'अपलोड',
    step2: 'काढा',
    step3: 'भरा',
    step4: 'निर्यात',
    
    // Upload Section
    uploadTitle: 'तुमची कागदपत्रे अपलोड करा',
    uploadDescription: 'आधार, पॅन कार्ड, मतदार ओळखपत्र किंवा इतर सरकारी कागदपत्रे अपलोड करा',
    dragDrop: 'फाइल्स इथे ड्रॅग आणि ड्रॉप करा',
    or: 'किंवा',
    browseFiles: 'फाइल्स ब्राउझ करा',
    supportedFormats: 'समर्थित फॉरमॅट: PDF, JPG, PNG (कमाल 10MB)',
    
    // Document Types
    aadhaar: 'आधार कार्ड',
    panCard: 'पॅन कार्ड',
    voterId: 'मतदार ओळखपत्र',
    passport: 'पासपोर्ट',
    drivingLicense: 'वाहन चालक परवाना',
    
    // Processing
    processing: 'प्रक्रिया सुरू...',
    extracting: 'माहिती काढत आहोत...',
    analyzing: 'कागदपत्राचे विश्लेषण करत आहोत...',
    completed: 'पूर्ण',
    
    // Extracted Data
    extractedData: 'काढलेली माहिती',
    name: 'पूर्ण नाव',
    fatherName: 'वडिलांचे नाव',
    dateOfBirth: 'जन्मतारीख',
    gender: 'लिंग',
    address: 'पत्ता',
    pincode: 'पिन कोड',
    state: 'राज्य',
    district: 'जिल्हा',
    idNumber: 'ओळख क्रमांक',
    aadhaarNumber: 'आधार क्रमांक',
    panNumber: 'पॅन क्रमांक',
    voterIdNumber: 'मतदार ओळखपत्र क्रमांक',
    drivingLicenseNumber: 'वाहन चालक परवाना क्रमांक',
    
    // Form
    smartForm: 'स्मार्ट फॉर्म',
    formDescription: 'स्वयंचलितपणे भरलेल्या माहितीचे पुनरावलोकन आणि संपादन करा',
    personalDetails: 'वैयक्तिक तपशील',
    addressDetails: 'पत्त्याचे तपशील',
    documentDetails: 'कागदपत्रांचे तपशील',
    
    // Gender options
    male: 'पुरुष',
    female: 'स्त्री',
    other: 'इतर',
    
    // Actions
    submit: 'सबमिट करा',
    save: 'जतन करा',
    download: 'PDF डाउनलोड करा',
    downloadForm: 'फॉर्म डाउनलोड करा',
    edit: 'संपादित करा',
    clear: 'साफ करा',
    reset: 'रीसेट',
    next: 'पुढे',
    previous: 'मागे',
    cancel: 'रद्द करा',
    confirm: 'पुष्टी करा',
    copy: 'कॉपी',
    copied: 'कॉपी झाले!',
    copyAll: 'सर्व कॉपी करा',
    copyForForms: 'इतर फॉर्मसाठी कॉपी करा',
    copyPersonal: 'वैयक्तिक तपशील',
    copyAddress: 'पत्ता',
    copyIds: 'ओळख क्रमांक',
    copyEverything: 'सर्व काही',
    
    // Voice
    voiceInput: 'आवाज इनपुट',
    speakNow: 'आता बोला...',
    listening: 'ऐकत आहोत...',
    tapToSpeak: 'बोलण्यासाठी टॅप करा',
    
    // Review
    reviewTitle: 'तुमच्या माहितीचे पुनरावलोकन करा',
    reviewDescription: 'काढलेल्या डेटाची तुमच्या मूळ कागदपत्राशी तुलना करा',
    originalDocument: 'मूळ कागदपत्र',
    extractedInfo: 'काढलेली माहिती',
    sideBySize: 'बाजूला बाजूला दृश्य',
    
    // Messages
    uploadSuccess: 'कागदपत्र यशस्वीरित्या अपलोड झाले!',
    extractionComplete: 'डेटा काढणे पूर्ण!',
    formSaved: 'फॉर्म यशस्वीरित्या जतन झाला!',
    downloadReady: 'तुमचे PDF डाउनलोडसाठी तयार आहे',
    
    // Errors
    uploadError: 'कागदपत्र अपलोड करताना त्रुटी',
    extractionError: 'डेटा काढताना त्रुटी',
    invalidFormat: 'अवैध फाइल फॉरमॅट',
    fileTooLarge: 'फाइलचा आकार 10MB पेक्षा जास्त आहे',
    
    // Language
    language: 'भाषा',
    english: 'English',
    hindi: 'हिंदी',
    
    // Footer
    poweredBy: 'AI द्वारे संचालित',
    secureProcessing: 'सुरक्षित आणि खाजगी प्रक्रिया',
    copyright: '',
  },
} as const;

export type TranslationKey = keyof typeof translations.en;

export function getTranslation(lang: Language, key: TranslationKey): string {
  return translations[lang][key] || translations.en[key];
}
