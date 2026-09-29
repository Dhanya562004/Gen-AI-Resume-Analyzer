import io
from pypdf import PdfReader
import pdfplumber
from xhtml2pdf import pisa


def extract_text_from_pdf(pdf_file) -> str:
    """
    Extracts text from uploaded PDF file using pypdf and pdfplumber as fallback.
    """
    text = ""
    try:
        # First attempt: pypdf
        pdf_bytes = pdf_file.read()
        pdf_file.seek(0)  # reset pointer
        reader = PdfReader(io.BytesIO(pdf_bytes))
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    except Exception as e:
        text = ""

    if not text.strip():
        try:
            # Fallback attempt: pdfplumber
            pdf_file.seek(0)
            with pdfplumber.open(pdf_file) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
        except Exception as e:
            pass

    return text.strip()


def generate_pdf_from_html(html_content: str) -> bytes:
    """
    Converts HTML string to downloadable PDF binary bytes using xhtml2pdf.
    """
    # Wrap in standard HTML structure if needed
    if "<html>" not in html_content.lower():
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                @page {{
                    size: a4 portrait;
                    margin: 1.5cm;
                }}
                body {{
                    font-family: Helvetica, Arial, sans-serif;
                    font-size: 10pt;
                    color: #333333;
                    line-height: 1.4;
                }}
                h1 {{ font-size: 20pt; color: #1e3a8a; margin-bottom: 5px; }}
                h2 {{ font-size: 14pt; color: #1e40af; border-bottom: 1px solid #cbd5e1; padding-bottom: 3px; margin-top: 15px; }}
                h3 {{ font-size: 11pt; color: #1f2937; margin-bottom: 2px; }}
                ul {{ margin-top: 3px; margin-bottom: 8px; padding-left: 20px; }}
                li {{ margin-bottom: 3px; }}
                .sidebar {{ background-color: #f8fafc; padding: 10px; border-radius: 5px; }}
                .badge {{ background-color: #e0e7ff; color: #3730a3; padding: 2px 6px; border-radius: 3px; font-size: 8pt; }}
            </style>
        </head>
        <body>
            {html_content}
        </body>
        </html>
        """

    result = io.BytesIO()
    pisa_status = pisa.CreatePDF(io.StringIO(html_content), dest=result)
    if pisa_status.err:
        raise Exception("Failed to compile HTML to PDF using xhtml2pdf.")
    return result.getvalue()
