import re
import base64
from io import BytesIO
from PIL import Image

# Read the source files
with open(r'c:\Users\zanxa\ZANXA\WEB\zanxa.site\projects\berkah-maju-elektrik\Template pdf\result-invoice.html', 'r', encoding='utf-8') as f:
    html_content = f.read()

# Try different encodings for INVOICE 2.htm
encodings = ['utf-8', 'latin-1', 'cp1252', 'iso-8859-1']
invoice2_content = None
for encoding in encodings:
    try:
        with open(r'c:\Users\zanxa\ZANXA\WEB\zanxa.site\projects\berkah-maju-elektrik\Template pdf\INVOICE 2.htm', 'r', encoding=encoding) as f:
            invoice2_content = f.read()
        print(f"Successfully read INVOICE 2.htm with {encoding} encoding")
        break
    except UnicodeDecodeError:
        continue

if invoice2_content is None:
    print("Error: Could not read INVOICE 2.htm with any encoding")
    exit(1)

# Extract the base64 image data
img_pattern = r'<img src="data:image/png;base64,([^"]+)"'
match = re.search(img_pattern, html_content)

if match:
    base64_data = match.group(1)
    
    # Decode the base64 image
    img_data = base64.b64decode(base64_data)
    img = Image.open(BytesIO(img_data))
    
    # Crop 60% from the bottom (keep only top 40%)
    width, height = img.size
    crop_height = int(height * 0.4)  # Keep top 40%, remove bottom 60%
    cropped_img = img.crop((0, 0, width, crop_height))
    
    # Convert back to base64
    buffered = BytesIO()
    cropped_img.save(buffered, format="PNG")
    cropped_base64 = base64.b64encode(buffered.getvalue()).decode('utf-8')
    
    # Replace the image in HTML
    html_content = html_content.replace(base64_data, cropped_base64)
    
    print(f"Image cropped from {height}px to {crop_height}px (kept top 40%, removed bottom 60%)")

# Extract table from INVOICE 2.htm
table_pattern = r'(<table class=TableGrid.*?</table>)'
table_match = re.search(table_pattern, invoice2_content, re.DOTALL)

if table_match:
    table_html = table_match.group(1)
    
    # Find where to insert the table - look for the closing body tag or the last div
    # Insert before the closing </body> tag
    body_close_pattern = r'(</body>)'
    body_match = re.search(body_close_pattern, html_content)
    
    if body_match:
        # Insert table before the closing body tag
        insertion_point = body_match.start()
        
        # Add some spacing and the table with proper styling
        table_insertion = f'''
\t\t<!-- Flexible Table Section -->
\t\t<div style="width: 100%; max-width: 800px; margin: 20px auto; padding: 0 20px;">
\t\t\t{table_html}
\t\t</div>
'''
        
        html_content = html_content[:insertion_point] + table_insertion + html_content[insertion_point:]
        
        print("Table inserted successfully before </body> tag")
    else:
        print("Could not find </body> tag to insert table")
else:
    print("Could not extract table from INVOICE 2.htm")

# Write the result
with open(r'c:\Users\zanxa\ZANXA\WEB\zanxa.site\projects\berkah-maju-elektrik\Template pdf\result-invoice.html', 'w', encoding='utf-8') as f:
    f.write(html_content)

print("result-invoice.html created successfully!")
