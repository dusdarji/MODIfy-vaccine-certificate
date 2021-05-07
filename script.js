$(document).ready(function() {
  const PDFDocument = PDFLib.PDFDocument;
  const StandardFonts = PDFLib.StandardFonts;
  const rgb = PDFLib.rgb;
  const degrees = PDFLib.degrees;
  var vaccineCertReader = new FileReader();
  var imageReader = new FileReader();
  var pdfData = null;
  var imgData = null;
  var vaccineCert = $('#vaccineCert');
  var userImage = $('#userImage');
  document.querySelector('#vaccineCert').addEventListener('change', savePDF, false);
  document.querySelector('#userImage').addEventListener('change', saveImage, false);
  function savePDF(e) {
    vaccineCertReader.readAsArrayBuffer(e.target.files[0]);  
  }
  function saveImage(e) {
    imageReader.readAsArrayBuffer(e.target.files[0]);  
  }
  vaccineCertReader.onload = function (e) {
    pdfData = e.target.result;
  }
  imageReader.onload = function (e) {
    imgData = e.target.result;
  }
  var submitBtn = document.querySelector('#submit-btn');
  submitBtn.addEventListener('click', onSubmit, false);
  function onSubmit() {
    if(vaccineCert && vaccineCert.val() && userImage && userImage.val() && pdfData && imgData) {
      modifyPdf();
      $(`#error-text`).get(0).textContent = '';
    } else {
      let errorText = 'Upload vaccine certificate and image';
      if(vaccineCert && vaccineCert.val()) {
        errorText = 'Upload image';
      }
      if(userImage && userImage.val()) {
        errorText = 'Upload vaccine certificate';
      }
      $(`#error-text`).get(0).textContent = errorText;
    }
  }
  async function modifyPdf() {

    // Load a PDFDocument from the existing PDF bytes
    const pdfDoc = await PDFDocument.load(pdfData)

    // Embed the Helvetica font
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica)

    // Get the first page of the document
    const pages = pdfDoc.getPages()
    const firstPage = pages[0]

    // Get the width and height of the first page
    const { width, height } = firstPage.getSize()

    let embedImg = null;
    if(userImage && userImage.val() && userImage.val().indexOf('.png') > -1) {
      embedImg = await pdfDoc.embedPng(imgData)
    } else {
      embedImg = await pdfDoc.embedJpg(imgData);
    }

    const imgDims = embedImg.scale(1);
    const imgRatio = imgDims.width / imgDims.height;

    let imageWidth = 105;
    let imageHeight = imageWidth/imgRatio;
    if(imageHeight > 105) {
      imageHeight = 105;
    }

    // Draw a string of text diagonally across the first page
    firstPage.drawImage(embedImg, {
      x: 30,
      y: 143,
      width: imageWidth,
      height: imageHeight,
    })

    // Serialize the PDFDocument to bytes (a Uint8Array)
    const pdfBytes = await pdfDoc.save()

    // Trigger the browser to download the PDF document
    download(pdfBytes, "MODIfied_cert.pdf", "application/pdf");
  }
})