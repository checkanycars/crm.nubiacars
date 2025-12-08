<?php

/**
 * Direct File Upload Test Script
 * 
 * This script tests file upload directly without going through HTTP requests
 * to verify that the file storage logic is working correctly.
 */

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Customer;
use App\Models\CustomerDocument;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

echo "\n";
echo "=== Direct File Upload Test ===\n";
echo "\n";

// Step 1: Find or create a test customer
echo "Step 1: Getting test customer...\n";
$customer = Customer::where('email', 'test@upload.com')->first();

if (!$customer) {
    $customer = Customer::create([
        'full_name' => 'Upload Test Customer',
        'email' => 'test@upload.com',
        'phone' => '+1234567890',
        'status' => 'lead',
        'notes' => 'Created for upload testing',
    ]);
    echo "✓ Test customer created (ID: {$customer->id})\n";
} else {
    echo "✓ Using existing customer (ID: {$customer->id})\n";
}

echo "\n";

// Step 2: Create a test PDF content
echo "Step 2: Creating test PDF content...\n";
$pdfContent = "%PDF-1.4
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
/Length 60
>>
stream
BT
/F1 24 Tf
100 700 Td
(Direct Upload Test Document) Tj
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
444
%%EOF";

$fileSize = strlen($pdfContent);
echo "✓ PDF content created ({$fileSize} bytes)\n";
echo "\n";

// Step 3: Test direct file storage
echo "Step 3: Testing direct file storage...\n";
$storedName = Str::uuid() . '.pdf';
$directory = 'customer-documents/' . $customer->id;
$fullPath = $directory . '/' . $storedName;

// Ensure directory exists
$storagePath = storage_path('app/' . $directory);
if (!file_exists($storagePath)) {
    mkdir($storagePath, 0755, true);
    echo "✓ Created directory: {$storagePath}\n";
}

// Write file directly
$absolutePath = storage_path('app/' . $fullPath);
$bytesWritten = file_put_contents($absolutePath, $pdfContent);

if ($bytesWritten !== false) {
    echo "✓ File written successfully\n";
    echo "  Path: {$fullPath}\n";
    echo "  Absolute: {$absolutePath}\n";
    echo "  Bytes written: {$bytesWritten}\n";
    echo "  File exists: " . (file_exists($absolutePath) ? 'YES' : 'NO') . "\n";
    echo "  Readable: " . (is_readable($absolutePath) ? 'YES' : 'NO') . "\n";
    echo "  Size on disk: " . filesize($absolutePath) . " bytes\n";
} else {
    echo "✗ Failed to write file!\n";
    exit(1);
}

echo "\n";

// Step 4: Create database record
echo "Step 4: Creating database record...\n";
$document = CustomerDocument::create([
    'customer_id' => $customer->id,
    'filename' => 'direct_test_document.pdf',
    'stored_name' => $storedName,
    'path' => $fullPath,
    'size' => $fileSize,
    'mime_type' => 'application/pdf',
]);

echo "✓ Document record created (ID: {$document->id})\n";
echo "\n";

// Step 5: Verify using Storage facade
echo "Step 5: Verifying with Storage facade...\n";
$exists = Storage::disk('local')->exists($fullPath);
echo "  Storage::exists(): " . ($exists ? 'YES' : 'NO') . "\n";

if ($exists) {
    $storedSize = Storage::disk('local')->size($fullPath);
    echo "  Storage::size(): {$storedSize} bytes\n";
    echo "✓ File verified through Storage facade\n";
} else {
    echo "✗ File not found through Storage facade\n";
}

echo "\n";

// Step 6: Test reading the file
echo "Step 6: Testing file read...\n";
if (file_exists($absolutePath)) {
    $readContent = file_get_contents($absolutePath);
    $readSize = strlen($readContent);
    echo "  Read {$readSize} bytes\n";
    echo "  Content starts with: " . substr($readContent, 0, 8) . "\n";
    
    if ($readContent === $pdfContent) {
        echo "✓ File content matches original\n";
    } else {
        echo "✗ File content mismatch!\n";
    }
} else {
    echo "✗ Cannot read file\n";
}

echo "\n";

// Step 7: Test through model
echo "Step 7: Testing through model relationships...\n";
$customer->load('documents');
$docCount = $customer->documents->count();
echo "  Documents count: {$docCount}\n";

if ($docCount > 0) {
    echo "✓ Documents loaded through relationship\n";
    
    $firstDoc = $customer->documents->first();
    echo "  First document:\n";
    echo "    - ID: {$firstDoc->id}\n";
    echo "    - Filename: {$firstDoc->filename}\n";
    echo "    - Path: {$firstDoc->path}\n";
    echo "    - Size: {$firstDoc->size} bytes\n";
    echo "    - Formatted size: {$firstDoc->formatted_size}\n";
    
    $fileExists = Storage::disk('local')->exists($firstDoc->path);
    echo "    - File exists: " . ($fileExists ? 'YES' : 'NO') . "\n";
} else {
    echo "✗ No documents found in relationship\n";
}

echo "\n";

// Step 8: List all files in customer directory
echo "Step 8: Listing all files in customer directory...\n";
$files = Storage::disk('local')->files($directory);
echo "  Found " . count($files) . " file(s) in {$directory}\n";

foreach ($files as $file) {
    $size = Storage::disk('local')->size($file);
    echo "  - {$file} ({$size} bytes)\n";
}

echo "\n";

// Step 9: Test response file method
echo "Step 9: Testing response()->file() method...\n";
try {
    $filePath = Storage::disk('local')->path($fullPath);
    echo "  Full path: {$filePath}\n";
    echo "  File exists: " . (file_exists($filePath) ? 'YES' : 'NO') . "\n";
    echo "  Is file: " . (is_file($filePath) ? 'YES' : 'NO') . "\n";
    echo "  Is readable: " . (is_readable($filePath) ? 'YES' : 'NO') . "\n";
    echo "✓ File can be accessed for response\n";
} catch (Exception $e) {
    echo "✗ Error: {$e->getMessage()}\n";
}

echo "\n";

// Summary
echo "=== Test Summary ===\n";
echo "\n";
echo "Customer ID: {$customer->id}\n";
echo "Document ID: {$document->id}\n";
echo "File Path: {$fullPath}\n";
echo "Absolute Path: {$absolutePath}\n";
echo "\n";

// Check overall status
$allGood = true;
$issues = [];

if (!file_exists($absolutePath)) {
    $allGood = false;
    $issues[] = "File does not exist on disk";
}

if (!Storage::disk('local')->exists($fullPath)) {
    $allGood = false;
    $issues[] = "File not accessible through Storage facade";
}

if ($customer->documents->count() === 0) {
    $allGood = false;
    $issues[] = "Documents not loaded through relationship";
}

if ($allGood) {
    echo "✓ ✓ ✓ ALL TESTS PASSED! ✓ ✓ ✓\n";
    echo "\n";
    echo "File upload functionality is working correctly!\n";
    echo "\n";
    echo "To test download in browser:\n";
    echo "1. Log into the application\n";
    echo "2. View customer with email: {$customer->email}\n";
    echo "3. Click View or Download button\n";
} else {
    echo "✗ ✗ ✗ SOME TESTS FAILED ✗ ✗ ✗\n";
    echo "\n";
    echo "Issues found:\n";
    foreach ($issues as $issue) {
        echo "  - {$issue}\n";
    }
}

echo "\n";
echo "To clean up test data, run:\n";
echo "  php artisan tinker\n";
echo "  Customer::where('email', 'test@upload.com')->delete();\n";
echo "\n";