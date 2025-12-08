#!/bin/bash

# Test script to manually upload a document to a customer

echo "=== Customer Document Upload Test ==="
echo ""

# Configuration
API_URL="http://localhost:8000/api"
CUSTOMER_ID=8

# Get auth token (you need to replace this with a valid token)
# To get a token, log in through the frontend and check localStorage
TOKEN=""

if [ -z "$TOKEN" ]; then
    echo "❌ Error: Please set the TOKEN variable in this script"
    echo ""
    echo "To get a token:"
    echo "1. Open your browser"
    echo "2. Open DevTools (F12)"
    echo "3. Go to Console tab"
    echo "4. Run: localStorage.getItem('auth_token')"
    echo "5. Copy the token and paste it in this script"
    exit 1
fi

# Create a test PDF file
echo "Creating test PDF file..."
cat > test_document.pdf << 'EOF'
%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj
2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj
3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
/Font <<
/F1 <<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
>>
>>
>>
endobj
4 0 obj
<<
/Length 44
>>
stream
BT
/F1 24 Tf
100 700 Td
(Test Document) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000314 00000 n
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
428
%%EOF
EOF

echo "✓ Test PDF created: test_document.pdf"
echo ""

# Test 1: Upload document using dedicated endpoint
echo "=== Test 1: Upload using /customers/{id}/documents ==="
echo ""

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
  "${API_URL}/customers/${CUSTOMER_ID}/documents" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Accept: application/json" \
  -F "documents[]=@test_document.pdf")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

echo "HTTP Status: $HTTP_CODE"
echo "Response: $BODY"
echo ""

if [ "$HTTP_CODE" = "201" ]; then
    echo "✓ Upload successful!"
    DOCUMENT_ID=$(echo "$BODY" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
    echo "  Document ID: $DOCUMENT_ID"
else
    echo "❌ Upload failed"
fi

echo ""
echo "=== Test 2: Create customer with document ==="
echo ""

# Test 2: Create new customer with document
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
  "${API_URL}/customers" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Accept: application/json" \
  -F "full_name=Test Customer $(date +%s)" \
  -F "email=test$(date +%s)@example.com" \
  -F "phone=+1234567890" \
  -F "status=lead" \
  -F "notes=Test customer with document" \
  -F "documents[]=@test_document.pdf")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

echo "HTTP Status: $HTTP_CODE"
echo "Response: $BODY"
echo ""

if [ "$HTTP_CODE" = "201" ]; then
    echo "✓ Customer created with document!"
    NEW_CUSTOMER_ID=$(echo "$BODY" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
    echo "  Customer ID: $NEW_CUSTOMER_ID"
else
    echo "❌ Creation failed"
fi

echo ""
echo "=== Test 3: Get customer with documents ==="
echo ""

# Test 3: Retrieve customer to verify documents
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET \
  "${API_URL}/customers/${CUSTOMER_ID}" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Accept: application/json")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

echo "HTTP Status: $HTTP_CODE"
echo ""

if [ "$HTTP_CODE" = "200" ]; then
    echo "✓ Customer retrieved successfully"
    echo ""
    echo "Documents in response:"
    echo "$BODY" | grep -o '"documents":\[.*\]' | head -1
    echo ""
    DOC_COUNT=$(echo "$BODY" | grep -o '"documents":\[' | wc -l)
    if [ "$DOC_COUNT" -gt 0 ]; then
        echo "✓ Documents field present in response"
    else
        echo "❌ Documents field missing from response"
    fi
else
    echo "❌ Retrieval failed"
fi

echo ""
echo "=== Test 4: Check file storage ==="
echo ""

# Check if files exist in storage
STORAGE_PATH="../storage/app/customer-documents/${CUSTOMER_ID}"

if [ -d "$STORAGE_PATH" ]; then
    echo "✓ Customer documents directory exists"
    FILE_COUNT=$(ls -1 "$STORAGE_PATH" 2>/dev/null | wc -l)
    echo "  Files in directory: $FILE_COUNT"
    
    if [ "$FILE_COUNT" -gt 0 ]; then
        echo "  Files:"
        ls -lh "$STORAGE_PATH" | tail -n +2
    else
        echo "❌ No files found in storage!"
    fi
else
    echo "❌ Customer documents directory does not exist: $STORAGE_PATH"
fi

echo ""
echo "=== Cleanup ==="
rm -f test_document.pdf
echo "✓ Test file removed"

echo ""
echo "=== Summary ==="
echo ""
echo "If all tests passed, the document upload is working correctly."
echo "If files are not appearing in storage, check:"
echo "  1. Laravel logs: tail -f storage/logs/laravel.log"
echo "  2. File permissions: chmod -R 775 storage/app"
echo "  3. Storage disk configuration in config/filesystems.php"
echo ""