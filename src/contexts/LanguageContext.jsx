
import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const languages = [
  { code: 'en', name: 'English', dir: 'ltr' },
  { code: 'es', name: 'Español', dir: 'ltr' },
  { code: 'fr', name: 'Français', dir: 'ltr' },
  { code: 'de', name: 'Deutsch', dir: 'ltr' },
  { code: 'zh', name: '中文 (Simplified)', dir: 'ltr' },
  { code: 'ja', name: '日本語', dir: 'ltr' },
  { code: 'ar', name: 'العربية', dir: 'rtl' },
  { code: 'pt', name: 'Português', dir: 'ltr' },
];

const translations = {
  en: {
    nav: {
      home: 'Home',
      services: 'Services',
      quote: 'Get Quote',
      track: 'Track',
      about: 'About',
      contact: 'Contact',
      dashboard: 'Dashboard',
      login: 'Log In',
      signup: 'Sign Up',
      signout: 'Sign Out'
    },
    logins: {
      loginTitle: 'Log into Account',
      noAccount: 'Have No Account?',
      signupNow: 'Signup',
      emailLabel: 'Email Address',
      emailPlaceholder: 'mail@example.com',
      passwordLabel: 'Password',
      passwordPlaceholder: 'Enter Password',
      signupTitle: 'Create New Account',
      haveAccount: 'Already have an Account?',
      loginNow: 'Login',
      signupButton: 'Signup',
      loginButton: 'Login',
      loggingIn: 'LoggingIn...'
    },


  "documents": {
    "pageTitle": "My Documents",
    "metaDescription": "Download your invoices, contracts, and shipping documents.",
    "title": "My Documents",
    "subtitle": "Access and download all your shipping-related documents in one place.",
    "download": "Download",
    "empty": {
      "title": "No documents yet",
      "description": "You haven’t generated any invoices or contracts. They’ll appear here once available."
    },
    "types": {
      "invoice": "Shipping invoice",
      "contract": "Service agreement",
      "receipt": "Payment receipt",
      "waybill": "Cargo waybill"
    },
    "success": {
      "downloadedTitle": "Download started",
      "downloadedDesc": "{{name}} is downloading..."
    },
    "errors": {
      "title": "Documents Error",
      "fetchFailed": "Failed to load your documents. Please try again later.",
      "downloadFailed": "Failed to download the document.",
      "noDownloadUrl": "This document is not available for download."
    }
  },

  "billing": {
    "pageTitle": "Billing & Invoices",
    "metaDescription": "Manage your SwiftParcel subscription, view invoices, and download receipts.",
    "title": "Billing & Invoices",
    "subtitle": "Track your payments, manage your plan, and access all financial documents.",
    "viewAllDocuments": "View All Documents",
    "subscription": {
      "title": "Current Plan",
      "description": "Your active subscription details",
      "basicPlan": "Basic Plan",
      "none": "You don’t have an active subscription."
    },
    "status": {
      "active": "Active",
      "pastDue": "Past Due",
      "canceled": "Canceled",
      "inactive": "Inactive"
    },
    "invoices": {
      "title": "Recent Invoices",
      "viewAll": "View all",
      "empty": {
        "title": "No invoices yet",
        "description": "Your invoices will appear here once you make a payment."
      }
    },
    "invoice": {
      "defaultDesc": "Shipping invoice"
    },
    "errors": {
      "title": "Billing Error",
      "fetchFailed": "Failed to load billing information. Please try again later."
    }
  },

  "login": {
    "loginTitlePage": "Log In",
    "signupTitlePage": "Sign Up",
    "metaDescription": "Access your SwiftParcel account securely.",
    "loginTitle": "Welcome back",
    "signupTitle": "Create your account",
    "emailLabel": "Email address",
    "emailPlaceholder": "you@example.com",
    "passwordLabel": "Password",
    "passwordPlaceholder": "••••••••",
    "loginButton": "Log in",
    "signupButton": "Sign up",
    "loginWithGoogle": "Continue with Google",
    "signupWithGoogle": "Sign up with Google",
    "orContinueWith": "or continue with email",
    "loginNow": "Log in now",
    "signupNow": "Sign up now",
    "haveAccount": "Already have an account?",
    "noAccount": "Don’t have an account?",
    "rememberMe": "Remember me",
    "forgotPassword": {
      "link": "Forgot password?",
      "title": "Reset your password",
      "description": "Enter your email and we’ll send you a link to reset your password.",
      "sendButton": "Send reset link",
      "sending": "Sending...",
      "successTitle": "Check your inbox",
      "successDesc": "We’ve sent a password reset link to {{email}}.",
      "errorTitle": "Unable to send reset link",
      "errorDesc": "Please check your email and try again.",
      "backToLogin": "Back to login"
    },
    "errors": {
      "title": "Authentication failed",
      "generic": "An unexpected error occurred.",
      "emailInUse": "This email is already registered.",
      "invalidEmail": "Please enter a valid email.",
      "invalidCredentials": "Incorrect email or password.",
      "weakPassword": "Password must be at least 6 characters.",
      "tooManyRequests": "Too many attempts. Please wait.",
      "emailRequired": "Email is required.",
      "googleFailed": "Google sign-in failed",
      "tryAgain": "Please try again."
    },
    "success": {
      "loginTitle": "Logged in",
      "loginDesc": "Redirecting to your dashboard...",
      "signupTitle": "Account created!",
      "signupDesc": "Please verify your email before logging in.",
      "googleLogin": "Signed in with Google"
    },
    "loggingIn": "Logging in...",
    "signingUp": "Creating account...",
    "footer": "Secure. Reliable. Fast."
  },
    home: {
      heroTitle: 'Seamless Shipping Starts Here!',
      heroSubtitle: 'Fast, reliable, and secure shipping solutions for businesses worldwide. Get your cargo delivered on time, every time.',
      getQuote: 'Get a Free Quote',
      viewDemo: 'View Demo',
      whyChoose: 'Why Choose SwiftParcel?',
      whyChooseSub: 'We provide comprehensive shipping solutions tailored to your business needs',
      securePkg: 'Secure Packaging',
      securePkgDesc: 'Professional packaging solutions for all cargo types',
      fastDelivery: 'Fast Delivery',
      fastDeliveryDesc: 'Express shipping options to meet your deadlines',
      insured: 'Insured Shipments',
      insuredDesc: 'Complete insurance coverage for peace of mind',
      support: '24/7 Support',
      supportDesc: 'Round-the-clock customer service and tracking'
    },
    track: {
      title: 'Track Your Shipment',
      subtitle: 'Enter your tracking ID to get real-time updates on your shipment',
      placeholder: 'Enter Tracking ID (e.g., SP1234567890)',
      button: 'Track',
      tracking: 'Tracking...',
      details: 'Shipment Details',
      status: 'Status',
      customer: 'Customer',
      contact: 'Contact',
      destination: 'Destination',
      address: 'Shipping Address',
      packageInfo: 'Package Information',
      created: 'Created',
      updated: 'Last Updated'
    },
    about: {
      title: 'About SwiftParcel',
      teamTitle: 'Our Team',
      subtitle: 'Your trusted partner in global logistics and shipping solutions since 2010',
      storyTitle: 'Our Story',
      storyText1: 'SwiftParcel was founded with a simple yet powerful vision: to make international shipping accessible, reliable, and stress-free for businesses of all sizes.',
      storyText2: 'Over the years, we have handled millions of shipments, helped thousands of businesses expand internationally, and built a reputation for excellence.',
      storyDesc1: 'SwiftParcel was founded with a simple yet powerful vision: to make international shipping accessible, reliable, and stress-free for businesses of all sizes.',
      storyDesc2: 'Over the years, we have handled millions of shipments, helped thousands of businesses expand internationally, and built a reputation for excellence.',
      mission: 'Our Mission',
      missionDesc: 'To provide seamless, reliable, and efficient shipping solutions.',
      team: 'Our Team',
      teamDesc: 'A dedicated team of logistics professionals with decades of experience.',
      commitment: 'Our Commitment',
      commitmentDesc: 'We are committed to excellence, transparency, and building long-term relationships.',
      reach: 'Global Reach',
      reachDesc: 'With partnerships across 150+ countries, we ensure your cargo reaches safely.',
      missionTitle: 'Mission',
      visionTitle: 'Vision',
      valuesTitle: 'Values',
      awardTitle: 'Awards',
      stats: {
        countries: 'Countries Served',
        shipments: 'Shipments Delivered',
        clients: 'Happy Clients',
        ontime: 'On-Time Delivery'
      }
    },
    contact: {
      title: 'Get in Touch',
      subtitle: 'Our global team is ready to assist you. Reach out to one of our regional offices or use our dedicated support channels.',
      howToReach: 'How to Reach Us',
      regionalOffices: 'Regional Offices',
      regionalContact: 'Regional Contact',
      general: 'General Inquiries',
      generalDesc: 'For general questions about our services, partnerships, and company information.',
      supportTitle: 'Customer Support',
      supportDesc: '24/7 assistance with tracking, account issues, and shipment problems.',
      sales: 'Sales & Quotes',
      salesDesc: 'Get custom quotes for high-volume shipping and business partnerships.',
      shipping: 'Shipping Operations',
      shippingDesc: 'Technical questions regarding customs, restricted items, and packaging guidelines.',
      formTitle: 'Send a Message',
      formName: 'Name',
      formEmail: 'Email',
      formSubject: 'Subject',
      formMessage: 'Message'
    },
    footer: {
        services: 'Services',
        company: 'Company',
        legal: 'Legal',
        airFreight: 'Air Freight',
        seaFreight: 'Sea Freight',
        roadFreight: 'Road Freight',
        warehousing: 'Warehousing',
        aboutUs: 'About Us',
        contact: 'Contact',
        trackShipment: 'Track Shipment',
        getQuote: 'Get Quote',
        privacyPolicy: 'Privacy Policy',
        termsOfService: 'Terms Of Service',
        cookiePolicy: 'Cookie & Policy',
        tagline: 'Socials'
    }
  },
  es: {
    nav: { home: 'Inicio', services: 'Servicios', quote: 'Cotizar', track: 'Rastrear', about: 'Nosotros', contact: 'Contacto', dashboard: 'Panel', login: 'Entrar', signup: 'Registro', signout: 'Salir' },
    home: {
      heroTitle: '¡El Envío Sin Problemas Comienza Aquí!',
      heroSubtitle: 'Soluciones de envío rápidas, confiables y seguras para empresas en todo el mundo.',
      getQuote: 'Obtener Cotización Gratis',
      viewDemo: 'Ver Demo',
      whyChoose: '¿Por qué elegir SwiftParcel?',
      whyChooseSub: 'Brindamos soluciones integrales de envío adaptadas a sus necesidades',
      securePkg: 'Embalaje Seguro',
      securePkgDesc: 'Soluciones de embalaje profesional para todo tipo de carga',
      fastDelivery: 'Entrega Rápida',
      fastDeliveryDesc: 'Opciones de envío exprés para cumplir con sus plazos',
      insured: 'Envíos Asegurados',
      insuredDesc: 'Cobertura de seguro completa para su tranquilidad',
      support: 'Soporte 24/7',
      supportDesc: 'Servicio al cliente y seguimiento las 24 horas'
    },
    track: { title: 'Rastrear su Envío', subtitle: 'Ingrese su ID de rastreo para obtener actualizaciones en tiempo real', placeholder: 'Ingrese ID de Rastreo', button: 'Rastrear', tracking: 'Rastreando...', details: 'Detalles del Envío', status: 'Estado', customer: 'Cliente', contact: 'Contacto', destination: 'Destino', address: 'Dirección', packageInfo: 'Información del Paquete', created: 'Creado', updated: 'Actualizado' },
    about: {
      title: 'Sobre SwiftParcel',
      subtitle: 'Su socio de confianza en logística global',
      storyTitle: 'Nuestra Historia',
      storyText1: 'SwiftParcel fue fundado con una visión simple: hacer que el envío internacional sea accesible y confiable.',
      storyText2: 'A lo largo de los años, hemos manejado millones de envíos y ayudado a miles de empresas.',
      mission: 'Nuestra Misión',
      missionDesc: 'Proporcionar soluciones de envío eficientes y confiables.',
      team: 'Nuestro Equipo',
      teamDesc: 'Un equipo dedicado de profesionales de la logística.',
      commitment: 'Nuestro Compromiso',
      commitmentDesc: 'Estamos comprometidos con la excelencia y la transparencia.',
      reach: 'Alcance Global',
      reachDesc: 'Con asociaciones en más de 150 países.',
      stats: { countries: 'Países Servidos', shipments: 'Envíos Entregados', clients: 'Clientes Felices', ontime: 'Entrega a Tiempo' }
    },
    contact: { title: 'Contáctenos', subtitle: 'Nuestro equipo global está listo para ayudarle.', howToReach: 'Cómo contactarnos', regionalOffices: 'Oficinas Regionales', regionalContact: 'Contacto Regional', general: 'Consultas Generales', generalDesc: 'Para preguntas generales sobre servicios.', supportTitle: 'Soporte al Cliente', supportDesc: 'Asistencia 24/7 con rastreo.', sales: 'Ventas y Cotizaciones', salesDesc: 'Obtenga cotizaciones personalizadas.', shipping: 'Operaciones de Envío', shippingDesc: 'Preguntas técnicas sobre aduanas.' }
  },
  fr: {
    nav: { home: 'Accueil', services: 'Services', quote: 'Devis', track: 'Suivre', about: 'À Propos', contact: 'Contact', dashboard: 'Tableau de bord', login: 'Connexion', signup: 'S\'inscrire', signout: 'Déconnexion' },
    home: {
      heroTitle: 'L\'expédition Transparente Commence Ici !',
      heroSubtitle: 'Solutions d\'expédition rapides, fiables et sécurisées pour les entreprises du monde entier.',
      getQuote: 'Obtenir un Devis Gratuit',
      viewDemo: 'Voir la Démo',
      whyChoose: 'Pourquoi Choisir SwiftParcel ?',
      whyChooseSub: 'Nous fournissons des solutions logistiques complètes',
      securePkg: 'Emballage Sécurisé',
      securePkgDesc: 'Solutions d\'emballage professionnelles',
      fastDelivery: 'Livraison Rapide',
      fastDeliveryDesc: 'Options d\'expédition express',
      insured: 'Expéditions Assurées',
      insuredDesc: 'Couverture d\'assurance complète',
      support: 'Support 24/7',
      supportDesc: 'Service client et suivi 24h/24'
    },
    track: { title: 'Suivre Votre Envoi', subtitle: 'Entrez votre ID de suivi pour des mises à jour en temps réel', placeholder: 'Entrez l\'ID de suivi', button: 'Suivre', tracking: 'Suivi...', details: 'Détails de l\'expédition', status: 'Statut', customer: 'Client', contact: 'Contact', destination: 'Destination', address: 'Adresse', packageInfo: 'Info Colis', created: 'Créé', updated: 'Mis à jour' },
    about: { title: 'À Propos de SwiftParcel', subtitle: 'Votre partenaire de confiance en logistique', storyTitle: 'Notre Histoire', storyText1: 'Fondée pour rendre l\'expédition internationale accessible.', storyText2: 'Nous avons géré des millions d\'expéditions.', mission: 'Notre Mission', missionDesc: 'Fournir des solutions fiables.', team: 'Notre Équipe', teamDesc: 'Des professionnels dédiés.', commitment: 'Notre Engagement', commitmentDesc: 'Excellence et transparence.', reach: 'Portée Mondiale', reachDesc: 'Présent dans 150+ pays.', stats: { countries: 'Pays Desservis', shipments: 'Colis Livrés', clients: 'Clients Satisfaits', ontime: 'Livraison à Temps' } },
    contact: { title: 'Contactez-nous', subtitle: 'Notre équipe mondiale est là pour vous aider.', howToReach: 'Comment nous joindre', regionalOffices: 'Bureaux Régionaux', regionalContact: 'Contact Régional', general: 'Demandes Générales', generalDesc: 'Questions générales.', supportTitle: 'Support Client', supportDesc: 'Assistance 24/7.', sales: 'Ventes', salesDesc: 'Devis personnalisés.', shipping: 'Opérations', shippingDesc: 'Questions techniques.' }
  },
  de: {
    nav: { home: 'Start', services: 'Leistungen', quote: 'Angebot', track: 'Verfolgen', about: 'Über uns', contact: 'Kontakt', dashboard: 'Dashboard', login: 'Anmelden', signup: 'Registrieren', signout: 'Abmelden' },
    home: {
      heroTitle: 'Reibungsloser Versand beginnt hier!',
      heroSubtitle: 'Schnelle, zuverlässige und sichere Versandlösungen für Unternehmen weltweit.',
      getQuote: 'Kostenloses Angebot',
      viewDemo: 'Demo ansehen',
      whyChoose: 'Warum SwiftParcel?',
      whyChooseSub: 'Wir bieten umfassende Versandlösungen',
      securePkg: 'Sichere Verpackung',
      securePkgDesc: 'Professionelle Verpackungslösungen',
      fastDelivery: 'Schnelle Lieferung',
      fastDeliveryDesc: 'Express-Versandoptionen',
      insured: 'Versicherte Sendungen',
      insuredDesc: 'Vollständiger Versicherungsschutz',
      support: '24/7 Support',
      supportDesc: 'Rund um die Uhr Kundenservice'
    },
    track: { title: 'Sendung Verfolgen', subtitle: 'Geben Sie Ihre Tracking-ID ein', placeholder: 'Tracking-ID eingeben', button: 'Verfolgen', tracking: 'Suche...', details: 'Sendungsdetails', status: 'Status', customer: 'Kunde', contact: 'Kontakt', destination: 'Ziel', address: 'Adresse', packageInfo: 'Paketinfo', created: 'Erstellt', updated: 'Aktualisiert' },
    about: { title: 'Über SwiftParcel', subtitle: 'Ihr vertrauenswürdiger Logistikpartner', storyTitle: 'Unsere Geschichte', storyText1: 'Gegründet, um internationalen Versand einfach zu machen.', storyText2: 'Millionen von Sendungen abgewickelt.', mission: 'Unsere Mission', missionDesc: 'Effiziente Lösungen bieten.', team: 'Unser Team', teamDesc: 'Erfahrene Logistikprofis.', commitment: 'Unser Versprechen', commitmentDesc: 'Exzellenz und Transparenz.', reach: 'Globale Reichweite', reachDesc: 'In 150+ Ländern.', stats: { countries: 'Länder', shipments: 'Lieferungen', clients: 'Kunden', ontime: 'Pünktlichkeit' } },
    contact: { title: 'Kontakt', subtitle: 'Unser Team ist bereit zu helfen.', howToReach: 'So erreichen Sie uns', regionalOffices: 'Regionalbüros', regionalContact: 'Kontakt', general: 'Allgemein', generalDesc: 'Allgemeine Fragen.', supportTitle: 'Kundensupport', supportDesc: '24/7 Hilfe.', sales: 'Vertrieb', salesDesc: 'Angebote für Unternehmen.', shipping: 'Versand', shippingDesc: 'Technische Fragen.' }
  },
  zh: {
    nav: { home: '首页', services: '服务', quote: '获取报价', track: '追踪', about: '关于我们', contact: '联系我们', dashboard: '仪表板', login: '登录', signup: '注册', signout: '退出' },
    home: {
      heroTitle: '无缝运输从这里开始！',
      heroSubtitle: '为全球企业提供快速、可靠和安全的运输解决方案。',
      getQuote: '获取免费报价',
      viewDemo: '查看演示',
      whyChoose: '为什么选择 SwiftParcel？',
      whyChooseSub: '我们提供量身定制的综合运输解决方案',
      securePkg: '安全包装',
      securePkgDesc: '各类货物的专业包装方案',
      fastDelivery: '快速交付',
      fastDeliveryDesc: '满足您期限的快递选项',
      insured: '投保货物',
      insuredDesc: '让您安心的全程保险',
      support: '24/7 支持',
      supportDesc: '全天候客户服务和追踪'
    },
    track: { title: '追踪您的货物', subtitle: '输入追踪ID获取实时更新', placeholder: '输入追踪ID', button: '追踪', tracking: '追踪中...', details: '货物详情', status: '状态', customer: '客户', contact: '联系', destination: '目的地', address: '地址', packageInfo: '包裹信息', created: '创建时间', updated: '更新时间' },
    about: { title: '关于 SwiftParcel', subtitle: '您值得信赖的全球物流合作伙伴', storyTitle: '我们的故事', storyText1: '旨在让国际运输变得简单可靠。', storyText2: '多年来处理了数百万次运输。', mission: '我们的使命', missionDesc: '提供高效的运输方案。', team: '我们的团队', teamDesc: '敬业的物流专家。', commitment: '我们的承诺', commitmentDesc: '追求卓越和透明。', reach: '全球覆盖', reachDesc: '服务超过150个国家。', stats: { countries: '服务国家', shipments: '已交付货物', clients: '满意客户', ontime: '准时交付' } },
    contact: { title: '联系我们', subtitle: '我们的全球团队随时为您服务。', howToReach: '联系方式', regionalOffices: '区域办事处', regionalContact: '区域联系', general: '一般咨询', generalDesc: '一般性问题。', supportTitle: '客户支持', supportDesc: '24/7 协助。', sales: '销售与报价', salesDesc: '商业合作报价。', shipping: '运输运营', shippingDesc: '海关和包装问题。' }
  },
  ja: {
    nav: { home: 'ホーム', services: 'サービス', quote: '見積もり', track: '追跡', about: '会社概要', contact: 'お問い合わせ', dashboard: 'ダッシュボード', login: 'ログイン', signup: '登録', signout: 'ログアウト' },
    home: {
      heroTitle: 'シームレスな配送はここから！',
      heroSubtitle: '世界中のビジネスに向けた迅速、確実、安全な配送ソリューション。',
      getQuote: '無料見積もり',
      viewDemo: 'デモを見る',
      whyChoose: 'SwiftParcelが選ばれる理由',
      whyChooseSub: 'ビジネスニーズに合わせた包括的な配送ソリューション',
      securePkg: '安全な梱包',
      securePkgDesc: 'あらゆる貨物に対応する専門的な梱包',
      fastDelivery: '迅速な配達',
      fastDeliveryDesc: '期限を守るエクスプレス配送',
      insured: '保険付き配送',
      insuredDesc: '安心のための完全な保険適用',
      support: '24/7 サポート',
      supportDesc: '24時間体制のカスタマーサービス'
    },
    track: { title: '荷物の追跡', subtitle: '追跡IDを入力して最新状況を確認', placeholder: '追跡IDを入力', button: '追跡', tracking: '追跡中...', details: '配送詳細', status: 'ステータス', customer: 'お客様', contact: '連絡先', destination: '目的地', address: '住所', packageInfo: '荷物情報', created: '作成日', updated: '更新日' },
    about: { title: 'SwiftParcelについて', subtitle: '信頼できる物流パートナー', storyTitle: '私たちの物語', storyText1: '国際配送を身近で信頼できるものにするために設立されました。', storyText2: '数百万の配送実績があります。', mission: 'ミッション', missionDesc: '効率的なソリューションを提供します。', team: 'チーム', teamDesc: '経験豊富な専門家たち。', commitment: 'コミットメント', commitmentDesc: '卓越性と透明性を追求します。', reach: 'グローバルリーチ', reachDesc: '150カ国以上で展開。', stats: { countries: '対応国', shipments: '配送完了', clients: '顧客数', ontime: '定時配送率' } },
    contact: { title: 'お問い合わせ', subtitle: 'グローバルチームがサポートします。', howToReach: '連絡方法', regionalOffices: '地域オフィス', regionalContact: '地域連絡先', general: '一般のお問い合わせ', generalDesc: 'サービスに関する質問。', supportTitle: 'サポート', supportDesc: '24時間対応。', sales: '営業・見積もり', salesDesc: 'ビジネス向け見積もり。', shipping: '配送業務', shippingDesc: '税関や技術的な質問。' }
  },
  ar: {
    nav: { home: 'الرئيسية', services: 'الخدمات', quote: 'طلب عرض', track: 'تتبع', about: 'من نحن', contact: 'اتصل بنا', dashboard: 'لوحة التحكم', login: 'دخول', signup: 'تسجيل', signout: 'خروج' },
    home: {
      heroTitle: 'الشحن السلس يبدأ من هنا!',
      heroSubtitle: 'حلول شحن سريعة وموثوقة وآمنة للشركات في جميع أنحاء العالم.',
      getQuote: 'احصل على عرض سعر',
      viewDemo: 'شاهد العرض',
      whyChoose: 'لماذا تختار SwiftParcel؟',
      whyChooseSub: 'نقدم حلول شحن شاملة مصممة لاحتياجات عملك',
      securePkg: 'تغليف آمن',
      securePkgDesc: 'حلول تغليف احترافية لجميع أنواع البضائع',
      fastDelivery: 'توصيل سريع',
      fastDeliveryDesc: 'خيارات شحن سريع لتلبية مواعيدك',
      insured: 'شحنات مؤمنة',
      insuredDesc: 'تغطية تأمينية كاملة لراحة بالك',
      support: 'دعم 24/7',
      supportDesc: 'خدمة عملاء وتتبع على مدار الساعة'
    },
    track: { title: 'تتبع شحنتك', subtitle: 'أدخل رقم التتبع للحصول على تحديثات فورية', placeholder: 'أدخل رقم التتبع', button: 'تتبع', tracking: 'جاري التتبع...', details: 'تفاصيل الشحنة', status: 'الحالة', customer: 'العميل', contact: 'الاتصال', destination: 'الوجهة', address: 'العنوان', packageInfo: 'معلومات الطرد', created: 'تاريخ الإنشاء', updated: 'آخر تحديث' },
    about: { title: 'عن SwiftParcel', subtitle: 'شريكك الموثوق في الخدمات اللوجستية', storyTitle: 'قصتنا', storyText1: 'تأسست لجعل الشحن الدولي متاحاً وموثوقاً.', storyText2: 'قمنا بمعالجة الملايين من الشحنات.', mission: 'مهمتنا', missionDesc: 'توفير حلول شحن فعالة.', team: 'فريقنا', teamDesc: 'خبراء لوجستيات متخصصون.', commitment: 'التزامنا', commitmentDesc: 'التميز والشفافية.', reach: 'نطاق عالمي', reachDesc: 'نخدم أكثر من 150 دولة.', stats: { countries: 'دولة', shipments: 'شحنة تم تسليمها', clients: 'عميل سعيد', ontime: 'تسليم في الوقت' } },
    contact: { title: 'اتصل بنا', subtitle: 'فريقنا العالمي جاهز لمساعدتك.', howToReach: 'كيف تصل إلينا', regionalOffices: 'المكاتب الإقليمية', regionalContact: 'جهة الاتصال', general: 'استفسارات عامة', generalDesc: 'أسئلة عامة حول الخدمات.', supportTitle: 'دعم العملاء', supportDesc: 'مساعدة على مدار الساعة.', sales: 'المبيعات', salesDesc: 'عروض أسعار مخصصة.', shipping: 'عمليات الشحن', shippingDesc: 'أسئلة تقنية وجمركية.' }
  },
  pt: {
    nav: { home: 'Início', services: 'Serviços', quote: 'Cotação', track: 'Rastrear', about: 'Sobre', contact: 'Contato', dashboard: 'Painel', login: 'Entrar', signup: 'Cadastro', signout: 'Sair' },
    home: {
      heroTitle: 'Envio Sem Fronteiras Começa Aqui!',
      heroSubtitle: 'Soluções de envio rápidas, confiáveis e seguras para empresas em todo o mundo.',
      getQuote: 'Orçamento Grátis',
      viewDemo: 'Ver Demo',
      whyChoose: 'Por que SwiftParcel?',
      whyChooseSub: 'Fornecemos soluções logísticas completas',
      securePkg: 'Embalagem Segura',
      securePkgDesc: 'Soluções profissionais de embalagem',
      fastDelivery: 'Entrega Rápida',
      fastDeliveryDesc: 'Opções de envio expresso',
      insured: 'Envios Segurados',
      insuredDesc: 'Cobertura completa de seguro',
      support: 'Suporte 24/7',
      supportDesc: 'Atendimento ao cliente 24 horas'
    },
    track: { title: 'Rastrear Encomenda', subtitle: 'Digite seu ID para atualizações em tempo real', placeholder: 'ID de Rastreamento', button: 'Rastrear', tracking: 'Rastreando...', details: 'Detalhes do Envio', status: 'Status', customer: 'Cliente', contact: 'Contato', destination: 'Destino', address: 'Endereço', packageInfo: 'Info do Pacote', created: 'Criado', updated: 'Atualizado' },
    about: { title: 'Sobre a SwiftParcel', subtitle: 'Seu parceiro logístico de confiança', storyTitle: 'Nossa História', storyText1: 'Fundada para tornar o envio internacional acessível.', storyText2: 'Gerenciamos milhões de envios.', mission: 'Nossa Missão', missionDesc: 'Fornecer soluções eficientes.', team: 'Nossa Equipe', teamDesc: 'Profissionais dedicados.', commitment: 'Nosso Compromisso', commitmentDesc: 'Excelência e transparência.', reach: 'Alcance Global', reachDesc: 'Presente em 150+ países.', stats: { countries: 'Países Atendidos', shipments: 'Entregas', clients: 'Clientes Felizes', ontime: 'No Prazo' } },
    contact: { title: 'Fale Conosco', subtitle: 'Nossa equipe global está pronta para ajudar.', howToReach: 'Como nos encontrar', regionalOffices: 'Escritórios Regionais', regionalContact: 'Contato Regional', general: 'Dúvidas Gerais', generalDesc: 'Perguntas gerais.', supportTitle: 'Suporte', supportDesc: 'Assistência 24/7.', sales: 'Vendas', salesDesc: 'Cotações personalizadas.', shipping: 'Operações', shippingDesc: 'Questões técnicas.' }
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    const savedLang = localStorage.getItem('swiftparcel-lang');
    if (savedLang && translations[savedLang]) {
      setLanguage(savedLang);
    }
  }, []);

  const changeLanguage = (langCode) => {
    setLanguage(langCode);
    localStorage.setItem('swiftparcel-lang', langCode);
    
    // Handle RTL
    const langConfig = languages.find(l => l.code === langCode);
    if (langConfig) {
      document.documentElement.dir = langConfig.dir;
      document.documentElement.lang = langConfig.code;
    }
  };

  const t = (path) => {
    const keys = path.split('.');
    let current = translations[language];
    
    for (const key of keys) {
      if (current[key] === undefined) {
        // Fallback to English
        let fallback = translations['en'];
        for (const fbKey of keys) {
          if (fallback[fbKey] === undefined) return path;
          fallback = fallback[fbKey];
        }
        return fallback;
      }
      current = current[key];
    }
    return current;
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
