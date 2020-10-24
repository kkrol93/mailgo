import {
  MailgoConfig,
  MailgoTranslations,
  MailgoTranslation,
  MailgoAction,
  MailgoModalType,
  MailgoLanguages,
  MailgoType,
} from "mailgo";
import { CLASSIC, LESS_SPAM } from "./constants";

// polyfill
// const { mailgoPolyfill } = require("./polyfill");

// constants
const {
  MAILTO,
  MAILGO,
  TEL,
  CALLTO,
  SMS,
  MAILGO_MAIL,
  MAILGO_TEL,
  MAILGO_SMS,
  NO_MAILGO,
  MOBILE,
  spanHTMLTag,
  aHTMLTag,
  pHTMLTag,
  defaultLang,
} = require("./constants");

// utils
const {
  validateEmails,
  validateTel,
  copyToClipboard,
  setFocusLoop,
} = require("./utils");

// i18n for mailgo
const languages: MailgoLanguages = require("../i18n/languages.json");
const translations: MailgoTranslations = require("../i18n/translations.json");

// mobile detect
const { userAgent } = require("./mobile-detect");

// mailgo scss
const mailgoCSS: string = require("./mailgo.scss").toString();

// default language
let lang: string = defaultLang;

// default strings
const defaultStrings: MailgoTranslation = translations[defaultLang];

// translation strings
let strings: MailgoTranslation;

// global mailgo config object
let config: MailgoConfig;

// config to check if the client is mobile or desktop
let isMobile: boolean = false;

// default config attributes
let mailtoEnabled: boolean = true;
let telEnabled: boolean = true;
let smsEnabled: boolean = false;
let desktopEnabled: boolean = true;
let mobileEnabled: boolean = true;
let validateEmailConfig: boolean = true;
let validateTelConfig: boolean = true;
let showFooterConfig: boolean = true;
let loadCSSConfig: boolean = true;

// activeMailgoType
let activeMailgoType: MailgoType;

// modals global object
let modalMailto: HTMLElement, modalTel: HTMLElement;

// mailgo variables
let url: URL,
  href: string,
  mail: string,
  encEmail: string,
  cc: string,
  bcc: string,
  subject: string,
  bodyMail: string;

// mailgo tel variables
let tel: string, msg: string, telegramUsername: string, skypeUsername: string;

// the DOM elements
let title: HTMLElement,
  titleTel: HTMLElement,
  detailCc: HTMLElement,
  detailBcc: HTMLElement,
  detailSubject: HTMLElement,
  detailBody: HTMLElement,
  detailMsg: HTMLElement,
  ccValue: HTMLElement,
  bccValue: HTMLElement,
  subjectValue: HTMLElement,
  bodyValue: HTMLElement,
  msgValue: HTMLElement,
  activatedLink: HTMLElement;

// mailgo buttons (actions)
let gmail: HTMLLinkElement,
  outlook: HTMLLinkElement,
  yahoo: HTMLLinkElement,
  open: HTMLLinkElement,
  telegram: HTMLLinkElement,
  wa: HTMLLinkElement,
  skype: HTMLLinkElement,
  call: HTMLLinkElement,
  copyMail: HTMLLinkElement,
  copyTel: HTMLLinkElement;

/**
 * mailgoInit
 * the function that creates the mailgo elements in DOM
 */
const mailgoInit = (): void => {
  // mailgo, if mailgo not already exists
  let mailgoExists = !!document.getElementById(MAILGO_MAIL);

  // set the boolean for mobile/desktop
  isMobile = userAgent() === MOBILE;

  // responsive settings
  {
    if (typeof config?.desktop !== "undefined") {
      desktopEnabled = config.desktop;
      // if it is a desktop and desktop is not enabled no init mailgo
      if (!isMobile && !desktopEnabled) {
        return;
      }
    }
    if (typeof config?.mobile !== "undefined") {
      mobileEnabled = config.mobile;
      // if it is a desktop and desktop is not enabled no init mailgo
      if (isMobile && !mobileEnabled) {
        return;
      }
    }
  }

  if (!mailgoExists) {
    // modal
    modalMailto = createElement() as HTMLElement;
    modalMailto.style.display = "none";
    modalMailto.id = MAILGO_MAIL;
    modalMailto.classList.add("m-modal");
    modalMailto.setAttribute("role", "dialog");
    modalMailto.setAttribute("tabindex", "-1");
    modalMailto.setAttribute("aria-labelledby", "m-title");

    // set the mailgo language
    mailgoSetLanguage();

    // if dark is in config
    if (config?.dark) {
      enableDarkMode();
    } else {
      disableDarkMode();
    }

    // background
    let modalBackground: HTMLElement = createElement();
    modalBackground.className = "m-modal-back";
    modalMailto.appendChild(modalBackground);

    // modal content
    let modalContent: HTMLElement = createElement();
    modalContent.className = "m-modal-content";
    modalMailto.appendChild(modalContent);

    // title (email address)
    title = createElement("strong");
    title.id = "m-title";
    title.className = "m-title";
    modalContent.appendChild(title);

    // details
    let details: HTMLElement = createElement();
    details.id = "m-details";
    details.className = "m-details";

    detailCc = createElement(pHTMLTag);
    detailCc.id = "m-cc";
    let ccSpan: HTMLElement = createElement(spanHTMLTag);
    ccSpan.className = "w-500";
    ccSpan.appendChild(createTextNode(strings.cc_ || defaultStrings.cc_));
    ccValue = createElement(spanHTMLTag);
    ccValue.id = "m-cc-value";
    detailCc.appendChild(ccSpan);
    detailCc.appendChild(ccValue);
    details.appendChild(detailCc);

    detailBcc = createElement(pHTMLTag);
    detailBcc.id = "m-bcc";
    let bccSpan: HTMLElement = createElement(spanHTMLTag);
    bccSpan.className = "w-500";
    bccSpan.appendChild(createTextNode(strings.bcc_ || defaultStrings.bcc_));
    bccValue = createElement(spanHTMLTag);
    bccValue.id = "m-bcc-value";
    detailBcc.appendChild(bccSpan);
    detailBcc.appendChild(bccValue);
    details.appendChild(detailBcc);

    detailSubject = createElement(pHTMLTag);
    detailSubject.id = "m-subject";
    let subjectSpan: HTMLElement = createElement(spanHTMLTag);
    subjectSpan.className = "w-500";
    subjectSpan.appendChild(
      createTextNode(strings.subject_ || defaultStrings.subject_)
    );
    subjectValue = createElement(spanHTMLTag);
    subjectValue.id = "m-subject-value";
    detailSubject.appendChild(subjectSpan);
    detailSubject.appendChild(subjectValue);
    details.appendChild(detailSubject);

    detailBody = createElement(pHTMLTag);
    detailBody.id = "m-body";
    let bodySpan: HTMLElement = createElement(spanHTMLTag);
    bodySpan.className = "w-500";
    bodySpan.appendChild(createTextNode(strings.body_ || defaultStrings.body_));
    bodyValue = createElement(spanHTMLTag);
    bodyValue.id = "m-body-value";
    detailBody.appendChild(bodySpan);
    detailBody.appendChild(bodyValue);
    details.appendChild(detailBody);

    modalContent.appendChild(details);

    // Gmail
    gmail = createElement(aHTMLTag) as HTMLLinkElement;
    gmail.id = "m-gmail";
    gmail.href = "#mailgo-gmail";
    gmail.classList.add("m-open");
    gmail.classList.add("m-gmail");
    gmail.appendChild(
      createTextNode(strings.open_in_ || defaultStrings.open_in_)
    );
    let gmailSpan: HTMLElement = createElement(spanHTMLTag);
    gmailSpan.className = "w-500";
    gmailSpan.appendChild(
      createTextNode(strings.gmail || defaultStrings.gmail)
    );
    gmail.appendChild(gmailSpan);

    if (mailgoActionEnabled("gmail")) modalContent.appendChild(gmail);

    // Outlook
    outlook = createElement(aHTMLTag) as HTMLLinkElement;
    outlook.id = "m-outlook";
    outlook.href = "#mailgo-outlook";
    outlook.classList.add("m-open");
    outlook.classList.add("m-outlook");
    outlook.appendChild(
      createTextNode(strings.open_in_ || defaultStrings.open_in_)
    );
    let outlookSpan: HTMLElement = createElement(spanHTMLTag);
    outlookSpan.className = "w-500";
    outlookSpan.appendChild(
      createTextNode(strings.outlook || defaultStrings.outlook)
    );
    outlook.appendChild(outlookSpan);

    if (mailgoActionEnabled("outlook")) {
      modalContent.appendChild(outlook);
    }

    // Outlook
    yahoo = createElement(aHTMLTag) as HTMLLinkElement;
    yahoo.id = "m-yahoo";
    yahoo.href = "#mailgo-yahoo";
    yahoo.classList.add("m-open");
    yahoo.classList.add("m-yahoo");
    yahoo.appendChild(
      createTextNode(strings.open_in_ || defaultStrings.open_in_)
    );
    let yahooSpan: HTMLElement = createElement(spanHTMLTag);
    yahooSpan.className = "w-500";
    yahooSpan.appendChild(
      createTextNode(strings.yahoo || defaultStrings.yahoo)
    );
    yahoo.appendChild(yahooSpan);

    if (mailgoActionEnabled("yahoo")) {
      modalContent.appendChild(yahoo);
    }

    // open default
    open = createElement(aHTMLTag) as HTMLLinkElement;
    open.id = "m-open";
    open.href = "#mailgo-open";
    open.classList.add("m-open");
    open.classList.add("m-default");
    let openSpan: HTMLElement = createElement(spanHTMLTag);
    openSpan.className = "w-500";
    openSpan.appendChild(createTextNode(strings.open || defaultStrings.open));
    open.appendChild(openSpan);
    open.appendChild(
      createTextNode(strings._default || defaultStrings._default)
    );

    modalContent.appendChild(open);

    // copy
    copyMail = createElement(aHTMLTag) as HTMLLinkElement;
    copyMail.id = "m-copy";
    copyMail.href = "#mailgo-copy";
    copyMail.classList.add("m-copy");
    copyMail.classList.add("w-500");
    copyMail.appendChild(createTextNode(strings.copy || defaultStrings.copy));

    modalContent.appendChild(copyMail);

    // hide mailgo.dev in footer only if showFooter is defined and equal to false
    if (typeof config?.showFooter !== "undefined") {
      showFooterConfig = config.showFooter;
    }

    if (showFooterConfig) {
      modalContent.appendChild(byElement());
    }

    // add the modal at the end of the body
    document.body.appendChild(modalMailto);

    // every click outside the modal will hide the modal
    modalBackground.addEventListener("click", hideMailgo);
  }

  // mailgo tel, if mailgo-tel not already exists
  let mailgoTelExists = !!document.getElementById(MAILGO_TEL);

  if (!mailgoTelExists) {
    // modal
    modalTel = createElement() as HTMLElement;
    modalTel.style.display = "none";
    modalTel.id = MAILGO_TEL;
    modalTel.classList.add("m-modal");
    modalTel.setAttribute("role", "dialog");
    modalTel.setAttribute("tabindex", "-1");
    modalTel.setAttribute("aria-labelledby", "m-tel-title");

    // if dark is in config
    if (config?.dark) {
      enableDarkMode();
    } else {
      disableDarkMode();
    }

    // background
    let modalBackground: HTMLElement = createElement();
    modalBackground.className = "m-modal-back";
    modalTel.appendChild(modalBackground);

    // modal content
    let modalContent: HTMLElement = createElement();
    modalContent.className = "m-modal-content";
    modalTel.appendChild(modalContent);

    // title (telephone number)
    titleTel = createElement("strong");
    titleTel.id = "m-tel-title";
    titleTel.className = "m-title";
    modalContent.appendChild(titleTel);

    // details
    let detailsTel: HTMLElement = createElement();
    detailsTel.id = "m-tel-details";
    detailsTel.className = "m-details";

    detailMsg = createElement(pHTMLTag);
    detailMsg.id = "m-msg";
    let msgSpan: HTMLElement = createElement(spanHTMLTag);
    msgSpan.className = "w-500";
    msgSpan.appendChild(createTextNode(strings.body_ || defaultStrings.body_));
    msgValue = createElement(spanHTMLTag);
    msgValue.id = "m-msg-value";
    detailMsg.appendChild(msgSpan);
    detailMsg.appendChild(msgValue);
    detailsTel.appendChild(detailMsg);

    modalContent.appendChild(detailsTel);

    // Telegram
    telegram = createElement(aHTMLTag) as HTMLLinkElement;
    telegram.id = "m-tg";
    telegram.href = "#mailgo-telegram";
    telegram.classList.add("m-open");
    telegram.classList.add("m-tg");

    // by default not display
    telegram.style.display = "none";

    telegram.appendChild(
      createTextNode(strings.open_in_ || defaultStrings.open_in_)
    );
    let telegramSpan: HTMLElement = createElement(spanHTMLTag);
    telegramSpan.className = "w-500";
    telegramSpan.appendChild(
      createTextNode(strings.telegram || defaultStrings.telegram)
    );
    telegram.appendChild(telegramSpan);

    if (mailgoActionEnabled("telegram")) {
      modalContent.appendChild(telegram);
    }

    // WhatsApp
    wa = createElement(aHTMLTag) as HTMLLinkElement;
    wa.id = "m-wa";
    wa.href = "#mailgo-whatsapp";
    wa.classList.add("m-open");
    wa.classList.add("m-wa");
    wa.appendChild(createTextNode(strings.open_in_ || defaultStrings.open_in_));
    let waSpan: HTMLElement = createElement(spanHTMLTag);
    waSpan.className = "w-500";
    waSpan.appendChild(
      createTextNode(strings.whatsapp || defaultStrings.whatsapp)
    );
    wa.appendChild(waSpan);

    if (mailgoActionEnabled("whatsapp")) {
      modalContent.appendChild(wa);
    }

    // Skype
    skype = createElement(aHTMLTag) as HTMLLinkElement;
    skype.id = "m-skype";
    skype.href = "#mailgo-skype";
    skype.classList.add("m-open");
    skype.classList.add("m-skype");
    skype.appendChild(
      createTextNode(strings.open_in_ || defaultStrings.open_in_)
    );
    let skypeSpan: HTMLElement = createElement(spanHTMLTag);
    skypeSpan.className = "w-500";
    skypeSpan.appendChild(
      createTextNode(strings.skype || defaultStrings.skype)
    );
    skype.appendChild(skypeSpan);

    if (mailgoActionEnabled("skype")) {
      modalContent.appendChild(skype);
    }

    // call default
    call = createElement(aHTMLTag) as HTMLLinkElement;
    call.id = "m-call";
    call.href = "#mailgo-open";
    call.classList.add("m-open");
    call.classList.add("m-default");
    let callSpan: HTMLElement = createElement(spanHTMLTag);
    callSpan.className = "w-500";
    callSpan.appendChild(createTextNode(strings.call || defaultStrings.call));
    call.appendChild(callSpan);
    call.appendChild(
      createTextNode(strings._as_default || defaultStrings._as_default)
    );

    modalContent.appendChild(call);

    // copy
    copyTel = createElement(aHTMLTag) as HTMLLinkElement;
    copyTel.id = "m-tel-copy";
    copyTel.href = "#mailgo-copy";
    copyTel.classList.add("m-copy");
    copyTel.classList.add("w-500");
    copyTel.appendChild(createTextNode(strings.copy || defaultStrings.copy));

    modalContent.appendChild(copyTel);

    // hide mailgo.dev in footer only if showFooter is defined and equal to false
    if (typeof config?.showFooter !== "undefined") {
      showFooterConfig = config.showFooter;
    }

    if (showFooterConfig) {
      modalContent.appendChild(byElement());
    }

    // add the modal at the end of the body
    document.body.appendChild(modalTel);

    // every click outside the modal will hide the modal
    modalBackground.addEventListener("click", hideMailgo);
  }

  // event listener on body, if the element is mailgo-compatible the mailgo modal will be rendered
  document.addEventListener("click", mailgoCheckRender);
};

/**
 * mailgoCheckRender
 * function to check if an element is mailgo-enabled or not referencing to
 * mail:
 * document.querySelectorAll(
 *   'a[href^="mailto:" i]:not(.no-mailgo), a[href="#mailgo"], a.mailgo'
 * );
 * tel:
 * document.querySelectorAll(
 *   'a[href^="tel:" i]:not(.no-mailgo), a[href="#mailgo"], a.mailgo'
 * );
 * or
 * document.querySelectorAll(
 *   'a[href^="callto:" i]:not(.no-mailgo), a[href="#mailgo"], a.mailgo'
 * );
 * or
 * document.querySelectorAll(
 *   'a[href^="sms:" i]:not(.no-mailgo), a[href="#mailgo"], a.mailgo'
 * );
 */
function mailgoCheckRender(event: Event): boolean {
  // check if the mailgo HTML exists in the body
  if (
    !document.body.contains(modalMailto) ||
    !document.body.contains(modalTel)
  ) {
    return false;
  }

  // if a mailgo is already showing do nothing
  if (mailgoIsShowing(MAILGO_MAIL) || mailgoIsShowing(MAILGO_TEL)) {
    return false;
  }

  // the path of the event
  let path =
    (event.composedPath && event.composedPath()) ||
    composedPath(event.target as HTMLElement);

  if (path) {
    path.forEach((element: HTMLElement) => {
      if (element instanceof HTMLDocument || element instanceof Window) {
        return false;
      }

      // go here only if one of the mailgo modals are enabled
      if (mailtoEnabled || telEnabled || smsEnabled) {
        let localMailgoType = getMailgoTypeByElement(element);

        // go on if the localMailgoType is not null
        if (localMailgoType) {
          // set the active mailgo type
          activeMailgoType = localMailgoType;

          let activeMailgoModalType = activeMailgoType?.type;

          if (activeMailgoModalType) {
            // check if the setting is enabled and if so go with pre-render
            if (
              (mailtoEnabled && activeMailgoModalType === MAILGO_MAIL) ||
              (telEnabled && activeMailgoModalType === MAILGO_TEL) ||
              (smsEnabled && activeMailgoModalType === MAILGO_SMS)
            ) {
              // stop the normal execution of the element click
              event.preventDefault();

              // render mailgo
              mailgoPreRender(element as HTMLLinkElement);

              return true;
            }
          }
        }
      }
    });
  }

  return false;
}

/**
 * mailgoPreRender
 * function to pre-render a mailgo, it helps populating elements needed by modal
 */
function mailgoPreRender(
  mailgoElementOrUrl: HTMLLinkElement | string
): boolean {
  let mailgoElement: HTMLLinkElement;

  // get the type from current mailgo type
  let type = activeMailgoType?.type;

  // if type is not defined return
  if (!type) return false;

  if (typeof mailgoElementOrUrl === "string") {
    // if the parameter is a string it is the url
    href = mailgoElementOrUrl as string;
  } else {
    // if the paramenter is an HTMLLinkElement get the href attribute and the element
    href = mailgoElementOrUrl.href as string;
    mailgoElement = mailgoElementOrUrl as HTMLLinkElement;
  }

  // if href is undefined or null return false
  if (!href) {
    return false;
  }

  // mailgo mail
  if (type === MAILGO_MAIL) {
    // if the element href=^"mailto:" or href=^"mailgo:"
    if (validateUrl(href, MAILTO) || validateUrl(href, MAILGO)) {
      if (validateUrl(href, MAILTO)) {
        mail = decodeURIComponent(href.split("?")[0].split(MAILTO)[1].trim());
      } else if (validateUrl(href, MAILGO)) {
        mail = decodeURIComponent(href.split("?")[0].split(MAILGO)[1].trim());
      }

      try {
        url = new URL(href);

        let urlParams: URLSearchParams = url.searchParams;

        // optional parameters for the email
        cc = urlParams.get("cc");
        bcc = urlParams.get("bcc");
        subject = urlParams.get("subject");
        bodyMail = urlParams.get("body");
      } catch (error) {
        // console.error(error);
      }
    } else {
      // if the element href="#mailgo" or class="mailgo"
      // mail = data-address + @ + data-domain
      mail =
        mailgoElement.getAttribute("data-address") +
        "@" +
        mailgoElement.getAttribute("data-domain");

      try {
        url = new URL(MAILTO + encodeURIComponent(mail));
      } catch (error) {
        // console.error(error);
      }

      // cc = data-cc-address + @ + data-cc-domain
      cc =
        mailgoElement.getAttribute("data-cc-address") +
        "@" +
        mailgoElement.getAttribute("data-cc-domain");

      // bcc = data-bcc-address + @ + data-bcc-domain
      bcc =
        mailgoElement.getAttribute("data-bcc-address") +
        "@" +
        mailgoElement.getAttribute("data-bcc-domain");

      // subject = data-subject
      subject = mailgoElement.getAttribute("data-subject");

      // body = data-body
      bodyMail = mailgoElement.getAttribute("data-body");
    }

    encEmail = encode(mail);

    // if is in config use it
    if (typeof config?.validateEmail !== "undefined") {
      validateEmailConfig = config.validateEmail;
    }

    if (validateEmailConfig) {
      // validate the email address
      if (!validateEmails(mail.split(","))) {
        return false;
      }

      // if cc, bcc are not valid cc, bcc = ""
      if (cc && !validateEmails(cc.split(","))) cc = "";
      if (bcc && !validateEmails(bcc.split(","))) bcc = "";
    }
  }
  // mailgo tel
  else if (type === MAILGO_TEL) {
    if (validateUrl(href, TEL)) {
      tel = decodeURIComponent(href.split("?")[0].split(TEL)[1].trim());
    } else if (validateUrl(href, CALLTO)) {
      tel = decodeURIComponent(href.split("?")[0].split(CALLTO)[1].trim());
    } else if (validateUrl(href, SMS)) {
      tel = decodeURIComponent(href.split("?")[0].split(SMS)[1].trim());

      try {
        url = new URL(href);
        let urlParams: URLSearchParams = url.searchParams;

        // optional parameters for the phone number
        msg = urlParams.get("body");
      } catch (error) {
        // console.error(error);
      }
    } else if (mailgoElement.hasAttribute("data-tel")) {
      tel = mailgoElement.getAttribute("data-tel");
      msg = mailgoElement.getAttribute("data-msg");
    }

    // if is in config use it
    if (typeof config?.validateTel !== "undefined") {
      validateTelConfig = config.validateTel;
    }

    // validate the phone number
    if (validateTelConfig) {
      if (!validateTel(tel)) return;
    }

    // Telegram username
    if (mailgoElement && mailgoElement.hasAttribute("data-telegram")) {
      telegramUsername = mailgoElement.getAttribute("data-telegram");
    } else {
      telegramUsername = null;
    }

    // Telegram username
    if (mailgoElement && mailgoElement.hasAttribute("data-skype")) {
      skypeUsername = mailgoElement.getAttribute("data-skype");
    } else {
      skypeUsername = null;
    }
  }

  // if config.dark is set to true then all the modals will be in dark mode
  if (mailgoElement && !config?.dark) {
    // if the element contains dark as class enable dark mode
    if (mailgoElement.classList.contains("dark")) {
      enableDarkMode();
    } else {
      disableDarkMode();
    }
  }

  // render mailgo
  mailgoRender();

  return true;
}

/**
 * mailgoDirectRender
 * function to render a mailgo directly from a URL
 */
function mailgoDirectRender(directUrl: string): boolean {
  // start mailgo
  mailgo();

  if (validateUrl(directUrl, MAILTO) || validateUrl(directUrl, MAILGO)) {
    activeMailgoType = {
      type: MAILGO_MAIL,
      installation: CLASSIC,
    };
    mailgoPreRender(directUrl);
    return true;
  } else if (
    validateUrl(directUrl, TEL) ||
    validateUrl(directUrl, CALLTO) ||
    validateUrl(directUrl, SMS)
  ) {
    activeMailgoType = {
      type: MAILGO_TEL,
      installation: CLASSIC,
    };
    mailgoPreRender(directUrl);
    return true;
  }
  return false;
}

/**
 * mailgoRender
 * function to render a mailgo (mail or tel)
 */
function mailgoRender(): boolean {
  // get the type from current mailgo type
  let type = activeMailgoType?.type;

  // if type is not defined return
  if (!type) return false;

  // mailgo mail
  if (type === MAILGO_MAIL) {
    // the title of the modal (email address)
    title.innerHTML = mail.split(",").join("<br/>");

    // add the details if provided
    if (cc) {
      detailCc.style.display = "block";
      ccValue.innerHTML = cc.split(",").join("<br/>");
    } else {
      detailCc.style.display = "none";
    }

    if (bcc) {
      detailBcc.style.display = "block";
      bccValue.innerHTML = bcc.split(",").join("<br/>");
    } else {
      detailBcc.style.display = "none";
    }

    if (subject) {
      detailSubject.style.display = "block";
      subjectValue.textContent = subject;
    } else {
      detailSubject.style.display = "none";
    }

    if (bodyMail) {
      detailBody.style.display = "block";
      bodyValue.textContent = bodyMail;
    } else {
      detailBody.style.display = "none";
    }

    // add the actions
    gmail.addEventListener("click", openGmail);

    outlook.addEventListener("click", openOutlook);

    yahoo.addEventListener("click", openYahooMail);

    open.addEventListener("click", openDefault);

    copyMail.addEventListener("click", (event) => {
      event.preventDefault();
      copy(mail);
    });
  }
  // mailgo tel
  else if (type === MAILGO_TEL) {
    // the title of the modal (tel)
    titleTel.innerHTML = tel;

    if (msg) {
      detailMsg.style.display = "block";
      msgValue.textContent = msg;
    } else {
      detailMsg.style.display = "none";
    }

    // add the actions to buttons
    wa.addEventListener("click", openWhatsApp);

    // telegram must be shown only if data-telegram is provided
    if (telegramUsername) {
      document.getElementById("m-tg").style.display = "block";
      telegram.addEventListener("click", openTelegram);
    } else {
      document.getElementById("m-tg").style.display = "none";
    }

    skype.addEventListener("click", openSkype);

    call.addEventListener("click", openDefault);

    copyTel.addEventListener("click", (event) => {
      event.preventDefault();
      copy(tel);
    });
  }

  // show the mailgo
  showMailgo();

  // add listener keyDown
  document.addEventListener("keydown", mailgoKeydown);

  return true;
}

// actions
const openGmail = (event?: Event): void => {
  event.preventDefault();

  let urlString: string;

  try {
    urlString = url.toString();
  } catch (e) {
    urlString = href;
  }

  // Gmail url
  let gmailUrl: string =
    "https://mail.google.com/mail/?extsrc=mailto&url=" +
    encodeURIComponent(urlString);

  // open the link
  window.open(gmailUrl, "_blank", "noopener, noreferrer");

  // hide the modal
  hideMailgo();
};

const openOutlook = (event?: Event): void => {
  event.preventDefault();

  // Outlook url
  let outlookUrl: string =
    "https://outlook.live.com/owa/?path=/mail/action/compose&to=" +
    encodeURIComponent(mail);

  // the details if provided
  if (subject) {
    outlookUrl = outlookUrl.concat("&subject=" + encodeURIComponent(subject));
  }

  if (bodyMail) {
    outlookUrl = outlookUrl.concat("&body=" + encodeURIComponent(bodyMail));
  }

  // open the link
  window.open(outlookUrl, "_blank", "noopener, noreferrer");

  // hide the modal
  hideMailgo();
};

const openYahooMail = (event?: Event): void => {
  event.preventDefault();

  // Yahoo url
  let yahooUrl: string = "https://compose.mail.yahoo.com/?to=" + mail;

  // the details if provided
  if (subject) {
    yahooUrl = yahooUrl.concat("&subject=" + encodeURIComponent(subject));
  }
  if (bodyMail) {
    yahooUrl = yahooUrl.concat("&body=" + encodeURIComponent(bodyMail));
  }

  // open the link
  window.open(yahooUrl, "_blank", "noopener, noreferrer");

  // hide the modal
  hideMailgo();
};

const openTelegram = (event?: Event): void => {
  event.preventDefault();

  // check if telegramUsername exists
  if (telegramUsername) {
    // Telegram url
    let tgUrl: string = "https://t.me/" + encodeURIComponent(telegramUsername);

    // open the url
    window.open(tgUrl, "_blank", "noopener, noreferrer");

    // hide the modal
    hideMailgo();
  }
};

const openSkype = (event?: Event): void => {
  event.preventDefault();

  let skype: string = skypeUsername || tel;

  // Telegram url
  let skypeUrl: string = "skype:" + encodeURIComponent(skype);

  // open the url
  window.open(skypeUrl, "_blank", "noopener, noreferrer");

  // hide the modal
  hideMailgo();
};

const openWhatsApp = (event?: Event): void => {
  event.preventDefault();

  // WhatsApp url
  let waUrl: string = "https://wa.me/" + encodeURIComponent(tel);

  // the details if provided
  if (msg) {
    waUrl = waUrl.concat("?text=" + msg);
  }

  // open the url
  window.open(waUrl, "_blank", "noopener, noreferrer");

  // hide the modal
  hideMailgo();
};

const openDefault = (event?: Event): void => {
  event.preventDefault();

  console.log(activeMailgoType);

  let type = activeMailgoType?.type;
  let installation = activeMailgoType?.installation;

  // if the installation is classic the browser can follow the default behaviour
  if (installation === CLASSIC) {
    window.location.href = href;
  } else {
    // the case of less-spam installation, href is not present or not useful
    let url;

    if (type === MAILGO_MAIL) {
      url = MAILTO + decode(mail);
    } else if (type === MAILGO_TEL) {
      url = TEL + tel;
    }

    if (url) {
      window.location.href = url;
    }
  }

  hideMailgo();
};

const copy = (content: string): void => {
  copyToClipboard(content);
  let activeCopy: HTMLElement;
  // the correct copyButton (mail or tel)
  if (mailgoIsShowing(MAILGO_MAIL)) {
    activeCopy = copyMail;
  } else {
    activeCopy = copyTel;
  }
  activeCopy.textContent = strings.copied || defaultStrings.copied;
  setTimeout(() => {
    activeCopy.textContent = strings.copy || defaultStrings.copy;
    // hide after the timeout
    hideMailgo();
  }, 999);
};

// function to find if a link is a mailto, tel, callto or sms
const validateUrl = (url: string, type: string = MAILTO) => {
  let regexValidate = new RegExp("^" + type, "gi");
  return regexValidate.test(url);
};

// function that returns if an element is a mailgo
function getMailgoTypeByElement(element: HTMLElement): MailgoType | null {
  let href: string = (element as HTMLLinkElement).getAttribute("href");

  // return null if there is no-mailgo in class
  if (element.classList?.contains(NO_MAILGO)) {
    return null;
  }

  if (href || element.classList?.contains("mailgo")) {
    //
    if (validateUrl(href, MAILTO) || validateUrl(href, MAILGO)) {
      return {
        type: MAILGO_MAIL,
        installation: CLASSIC,
      };
    } else if (validateUrl(href, TEL) || validateUrl(href, CALLTO)) {
      return {
        type: MAILGO_TEL,
        installation: CLASSIC,
      };
    } else if (validateUrl(href, SMS)) {
      return {
        type: MAILGO_SMS,
        installation: CLASSIC,
      };
    }
  }

  if (href === "#mailgo" || element.classList?.contains("mailgo")) {
    // GO ON
    if (element.hasAttribute("data-address")) {
      return {
        type: MAILGO_MAIL,
        installation: LESS_SPAM,
      };
    } else if (element.hasAttribute("data-tel")) {
      return {
        type: MAILGO_TEL,
        installation: LESS_SPAM,
      };
    } else if (element.hasAttribute("data-msg")) {
      return {
        type: MAILGO_SMS,
        installation: LESS_SPAM,
      };
    }
  }

  return null;
}

/**
 * mailgoKeydown
 * function to manage the keydown event when the modal is showing, return a boolean that represents if a useful key has been pressed
 */
const mailgoKeydown = (keyboardEvent: KeyboardEvent): boolean => {
  // if mailgo is showing
  if (mailgoIsShowing(MAILGO_MAIL)) {
    switch (keyboardEvent.keyCode) {
      case 27:
        // Escape
        hideMailgo();
        return true;
      case 71:
        // g -> open GMail
        openGmail();
        return true;
      case 79:
        // o -> open Outlook
        openOutlook();
        return true;
      case 89:
        // y -> open Yahoo Mail
        openYahooMail();
        return true;
      case 32:
      case 13:
        // spacebar or enter -> open default
        openDefault();
        return true;
      case 67:
        // c -> copy
        copy(mail);
        return true;
      default:
        return false;
    }
  } else if (mailgoIsShowing(MAILGO_TEL)) {
    switch (keyboardEvent.keyCode) {
      case 27:
        // Escape
        hideMailgo();
        return true;
      case 84:
        // t -> open Telegram
        openTelegram();
        return true;
      case 87:
        // w -> open WhatsApp
        openWhatsApp();
        return true;
      case 83:
        // s -> open Skype
        openSkype();
        return true;
      case 32:
      case 13:
        // spacebar or enter -> open default
        openDefault();
        return true;
      case 67:
        // c -> copy
        copy(tel);
        return true;
      default:
        return false;
    }
  }
  return false;
};

// show the modal
const showMailgo = (): void => {
  let type = activeMailgoType?.type;
  if (type) {
    // show the correct modal
    setModalDisplay(type, "flex");
  }
};

// hide the modal
const hideMailgo = (): void => {
  // hide all the modals
  setModalDisplay(MAILGO_MAIL, "none");
  setModalDisplay(MAILGO_TEL, "none");

  // remove listener keyDown
  document.removeEventListener("keydown", mailgoKeydown);
};

// is the mailgo modal hidden?
const mailgoIsShowing = (type = MAILGO_MAIL): boolean => {
  return getModalDisplay(type) === "flex";
};

const byElement = (): HTMLLinkElement => {
  // by
  let by: HTMLLinkElement = createElement(aHTMLTag) as HTMLLinkElement;
  by.href = "https://mailgo.dev?ref=mailgo-modal";
  by.className = "m-by";
  by.target = "_blank";
  by.rel = "noopener noreferrer";
  by.appendChild(createTextNode("mailgo.dev"));

  return by;
};

// create element
const createElement = (element: string = "div"): HTMLElement =>
  document.createElement(element);

// create text node
const createTextNode = (element: string): Text =>
  document.createTextNode(element);

// decode a string
const decode = (s: string): string => atob(s);

// encode a string
const encode = (s: string): string => btoa(s);

// get the correct HTMLElement from a type
const getModalHTMLElement = (type: string = MAILGO_MAIL) => {
  if (type === MAILGO_TEL) {
    return modalTel;
  } else {
    return modalMailto;
  }
};

// get display value
const getModalDisplay = (ref: string = MAILGO_MAIL): string =>
  getModalHTMLElement(ref).style.display;

// set display value
const setModalDisplay = (ref: string = MAILGO_MAIL, value: string): void => {
  let modal = getModalHTMLElement(ref);
  modal.style.display = value;

  if (value === "flex") {
    // "save" the activated link.
    activatedLink = document.activeElement as HTMLElement;
    modal.setAttribute("aria-hidden", "false");

    // Focus on the modal container.
    modal.setAttribute("tabindex", "0");
    modal.focus();
    setFocusLoop(modal);
  } else {
    modal.setAttribute("aria-hidden", "true");

    // focus back the activated link for getting back to the context.
    modal.setAttribute("tabindex", "-1");
    activatedLink.focus();
  }
};

// enable dark mode
const enableDarkMode = () => {
  // get the type from current mailgo type
  let type = activeMailgoType?.type;
  if (type) {
    getModalHTMLElement(type).classList.add("m-dark");
  }
};

// disable dark mode
const disableDarkMode = () => {
  // get the type from current mailgo type
  let type = activeMailgoType?.type;
  if (type) {
    getModalHTMLElement(type).classList.remove("m-dark");
  }
};

// custom composedPath if path or event.composedPath() are not defined
const composedPath = (
  el: HTMLElement
): (HTMLElement | Document | (Window & typeof globalThis))[] => {
  let path = [];

  while (el) {
    path.push(el);

    if (el.tagName === "HTML") {
      path.push(document);
      path.push(window);
      return path;
    }

    el = el.parentElement;
  }
};

// function to check an action is enabled or not
const mailgoActionEnabled = (action: MailgoAction): boolean => {
  // by default all the actions are enabled
  if (!config) {
    return true;
  }
  if (config && !config?.actions) {
    return true;
  }

  if (config && config.actions && config?.actions[action] === false) {
    return false;
  }

  return true;
};

// manage the language of mailgo
const mailgoSetLanguage = (): string => {
  let languageType = "default lang";

  // if a language is defined in configuration use it
  if (config?.lang && languages.indexOf(config.lang) !== -1) {
    lang = config.lang;
    languageType = "config lang";
  } else {
    // else if is defined <html lang=""> use it!
    // keep the lang from html
    let htmlLang: string = document.documentElement.lang;

    // find the correct language using the lang attribute, not just a === because there a are cases like fr-FR or fr_FR in html lang attribute
    languages.forEach((language: any) => {
      if (new RegExp("^" + language, "gi").test(htmlLang)) {
        lang = language;
        languageType = "html lang";
      }
    });
  }

  // strings
  strings = translations[lang];

  return languageType;
};

const mailgoStyle = (): void => {
  if (!document.getElementById("mailgo-style")) {
    // mailgo style
    let mailgoCSSElement: HTMLStyleElement = createElement(
      "style"
    ) as HTMLStyleElement;
    mailgoCSSElement.id = "mailgo-style";
    mailgoCSSElement.type = "text/css";
    mailgoCSSElement.appendChild(createTextNode(mailgoCSS));
    document.head.appendChild(mailgoCSSElement);
  }
};

// mailgo
function mailgo(mailgoConfig?: MailgoConfig): boolean {
  try {
    // polyfill mailgo
    // mailgoPolyfill();

    // set the global config merging window mailgConfig and mailgoConfig passed as a parameter
    config = { ...mailgoConfig, ...((window as any)?.mailgoConfig || null) };

    // if the window is defined...
    if (typeof window !== "undefined") {
      // if is set in config use it (load the mailgo CSS)
      if (typeof config?.loadCSS !== "undefined") {
        loadCSSConfig = config.loadCSS;
      }

      // if is set in config use it (enable mailto)
      if (typeof config?.mailto !== "undefined") {
        mailtoEnabled = config.mailto;
      }

      // if is set in config use it (enable tel)
      if (typeof config?.tel !== "undefined") {
        telEnabled = config.tel;
      }

      // if is set in config use it (enable sms)
      if (typeof config?.sms !== "undefined") {
        smsEnabled = config.sms;
      }

      // if load css enabled load it!
      if (loadCSSConfig) {
        // add the style for mailgo
        mailgoStyle();
      }

      // if is set an initEvent add the listener
      if (config?.initEvent) {
        if (config?.listenerOptions) {
          // listener options specified
          document.addEventListener(
            config.initEvent,
            mailgoInit,
            config.listenerOptions
          );
        } else {
          // no listener options
          document.addEventListener(config.initEvent, mailgoInit);
        }
      } else {
        mailgoInit();
      }

      return true;
    }
  } catch (error) {
    // console.error(error);
  }
  return false;
}

// define the methods also for window element
if (typeof window !== "undefined") {
  (window as any).getMailgoTypeByElement = getMailgoTypeByElement;
  (window as any).mailgoCheckRender = mailgoCheckRender;
  (window as any).mailgoPreRender = mailgoPreRender;
  (window as any).mailgoDirectRender = mailgoDirectRender;
  (window as any).mailgoRender = mailgoRender;
  (window as any).mailgo = mailgo;
}

export {
  getMailgoTypeByElement,
  mailgoCheckRender,
  mailgoPreRender,
  mailgoDirectRender,
  mailgoRender,
};

export default mailgo;
