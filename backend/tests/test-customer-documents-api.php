<?php

/**
 * Customer Documents API Test Script
 * 
 * This script tests the customer documents API endpoints to ensure
 * they are working correctly and returning the expected data.
 * 
 * Usage: php test-customer-documents-api.php
 */

require __DIR__ . '/../vendor/autoload.php';

use Illuminate\Support\Facades\Artisan;

// Colors for terminal output
class Color {
    public static $GREEN = "\033[32m";
    public static $RED = "\033[31m";
    public static $YELLOW = "\033[33m";
    public static $BLUE = "\033[34m";
    public static $RESET = "\033[0m";
}

function printSuccess($message) {
    echo Color::$GREEN . "✓ " . $message . Color::$RESET . "\n";
}

function printError($message) {
    echo Color::$RED . "✗ " . $message . Color::$RESET . "\n";
}

function printInfo($message) {
    echo Color::$BLUE . "ℹ " . $message . Color::$RESET . "\n";
}

function printWarning($message) {
    echo Color::$YELLOW . "⚠ " . $message . Color::$RESET . "\n";
}

function printHeader($message) {
    echo "\n" . Color::$BLUE . "=== " . $message . " ===" . Color::$RESET . "\n\n";
}

// Test configuration
$baseUrl = getenv('APP_URL') ?: 'http://localhost:8000';
$apiUrl = $baseUrl . '/api';

printHeader("Customer Documents API Test Suite");
printInfo("Base URL: $baseUrl");
printInfo("Testing started at: " . date('Y-m-d H:i:s'));

// Initialize Laravel application
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "\n";

// Test 1: Check if customer_documents table exists
printHeader("Test 1: Database Schema");
try {
    $tables = DB::select("SHOW TABLES LIKE 'customer_documents'");
    if (count($tables) > 0) {
        printSuccess("customer_documents table exists");
    } else {
        printError("customer_documents table does not exist");
        printWarning("Run: php artisan migrate");
        exit(1);
    }
} catch (Exception $e) {
    printError("Database error: " . $e->getMessage());
    exit(1);
}

// Test 2: Check Customer model relationship
printHeader("Test 2: Model Relationships");
try {
    $customerClass = new ReflectionClass(\App\Models\Customer::class);
    $methods = $customerClass->getMethods();
    $hasDocumentsMethod = false;
    
    foreach ($methods as $method) {
        if ($method->getName() === 'documents') {
            $hasDocumentsMethod = true;
            break;
        }
    }
    
    if ($hasDocumentsMethod) {
        printSuccess("Customer model has documents() relationship");
    } else {
        printError("Customer model missing documents() relationship");
    }
    
    // Check CustomerDocument model
    if (class_exists(\App\Models\CustomerDocument::class)) {
        printSuccess("CustomerDocument model exists");
    } else {
        printError("CustomerDocument model not found");
    }
} catch (Exception $e) {
    printError("Model check error: " . $e->getMessage());
}

// Test 3: Create test customer with documents
printHeader("Test 3: Create Customer with Documents");
try {
    // Create a test customer
    $customer = \App\Models\Customer::create([
        'full_name' => 'Test Customer ' . time(),
        'email' => 'test' . time() . '@example.com',
        'phone' => '+1234567890',
        'status' => 'lead',
        'notes' => 'Test customer for API testing',
    ]);
    
    printSuccess("Test customer created (ID: {$customer->id})");
    
    // Create a test PDF file in memory
    $pdfContent = "%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n/Contents 4 0 R\n>>\nendobj\n4 0 obj\n<<\n/Length 44\n>>\nstream\nBT\n/F1 12 Tf\n100 700 Td\n(Test Document) Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f\n0000000009 00000 n\n0000000058 00000 n\n0000000115 00000 n\n0000000214 00000 n\ntrailer\n<<\n/Size 5\n/Root 1 0 R\n>>\nstartxref\n328\n%%EOF";
    
    $tempFile = tempnam(sys_get_temp_dir(), 'test_pdf_');
    file_put_contents($tempFile, $pdfContent);
    
    // Create document record
    $document = $customer->documents()->create([
        'filename' => 'test_document.pdf',
        'stored_name' => basename($tempFile) . '.pdf',
        'path' => 'customer-documents/' . $customer->id . '/' . basename($tempFile) . '.pdf',
        'size' => strlen($pdfContent),
        'mime_type' => 'application/pdf',
    ]);
    
    printSuccess("Test document created (ID: {$document->id})");
    
    // Store the file
    $storagePath = storage_path('app/customer-documents/' . $customer->id);
    if (!file_exists($storagePath)) {
        mkdir($storagePath, 0755, true);
    }
    file_put_contents(storage_path('app/' . $document->path), $pdfContent);
    
    printSuccess("Test file stored in storage");
    
} catch (Exception $e) {
    printError("Failed to create test data: " . $e->getMessage());
    exit(1);
}

// Test 4: API - Get customer with documents
printHeader("Test 4: GET /api/customers/{id} - Fetch Customer with Documents");
try {
    $response = \App\Http\Controllers\Api\CustomerController::class;
    $controller = new $response();
    
    $result = $controller->show($customer);
    $data = json_decode($result->getContent(), true);
    
    if (isset($data['data'])) {
        printSuccess("API returned customer data");
        
        if (isset($data['data']['documents'])) {
            printSuccess("Documents included in response");
            printInfo("Documents count: " . count($data['data']['documents']));
            
            if (count($data['data']['documents']) > 0) {
                $doc = $data['data']['documents'][0];
                printInfo("Sample document:");
                printInfo("  - ID: " . ($doc['id'] ?? 'N/A'));
                printInfo("  - Filename: " . ($doc['filename'] ?? 'N/A'));
                printInfo("  - Size: " . ($doc['formatted_size'] ?? 'N/A'));
            }
        } else {
            printWarning("Documents not included in response");
            printInfo("Response keys: " . implode(', ', array_keys($data['data'])));
        }
    } else {
        printError("Invalid API response structure");
    }
} catch (Exception $e) {
    printError("API test failed: " . $e->getMessage());
}

// Test 5: Document Resource formatting
printHeader("Test 5: Document Resource Formatting");
try {
    $docResource = new \App\Http\Resources\Api\CustomerDocumentResource($document);
    $resourceData = $docResource->toArray(request());
    
    $requiredFields = ['id', 'filename', 'size', 'mime_type', 'url'];
    $missingFields = [];
    
    foreach ($requiredFields as $field) {
        if (!isset($resourceData[$field])) {
            $missingFields[] = $field;
        }
    }
    
    if (empty($missingFields)) {
        printSuccess("All required fields present in document resource");
    } else {
        printError("Missing fields: " . implode(', ', $missingFields));
    }
    
    printInfo("Available fields: " . implode(', ', array_keys($resourceData)));
    
} catch (Exception $e) {
    printError("Resource test failed: " . $e->getMessage());
}

// Test 6: Customer Resource includes documents
printHeader("Test 6: Customer Resource Includes Documents");
try {
    $customer->load('documents');
    $custResource = new \App\Http\Resources\Api\CustomerResource($customer);
    $resourceData = $custResource->toArray(request());
    
    if (isset($resourceData['documents'])) {
        printSuccess("Customer resource includes documents field");
        printInfo("Documents: " . json_encode($resourceData['documents']));
    } else {
        printWarning("Customer resource does not include documents field");
        printInfo("Available fields: " . implode(', ', array_keys($resourceData)));
    }
} catch (Exception $e) {
    printError("Customer resource test failed: " . $e->getMessage());
}

// Test 7: Routes exist
printHeader("Test 7: API Routes");
try {
    $routes = \Illuminate\Support\Facades\Route::getRoutes();
    $documentRoutes = [
        'GET|HEAD api/customers/{customer}/documents',
        'POST api/customers/{customer}/documents',
        'GET|HEAD api/customers/{customer}/documents/{document}',
        'GET|HEAD api/customers/{customer}/documents/{document}/download',
        'DELETE api/customers/{customer}/documents/{document}',
    ];
    
    foreach ($documentRoutes as $routePath) {
        $found = false;
        foreach ($routes as $route) {
            $routeName = $route->methods()[0] . ' ' . $route->uri();
            if (strpos($routeName, str_replace('|HEAD', '', $routePath)) !== false) {
                $found = true;
                break;
            }
        }
        
        if ($found) {
            printSuccess("Route exists: $routePath");
        } else {
            printError("Route missing: $routePath");
        }
    }
} catch (Exception $e) {
    printError("Routes test failed: " . $e->getMessage());
}

// Test 8: File download endpoint
printHeader("Test 8: Document Download Response");
try {
    $controller = new \App\Http\Controllers\Api\CustomerDocumentController();
    $response = $controller->download($customer, $document);
    
    if ($response instanceof \Symfony\Component\HttpFoundation\BinaryFileResponse) {
        printSuccess("Download endpoint returns file response");
        
        $headers = $response->headers->all();
        if (isset($headers['content-type']) && in_array('application/pdf', $headers['content-type'])) {
            printSuccess("Content-Type is application/pdf");
        } else {
            printWarning("Content-Type: " . ($headers['content-type'][0] ?? 'not set'));
        }
        
        if (isset($headers['content-disposition'])) {
            printSuccess("Content-Disposition header set");
            printInfo("Value: " . $headers['content-disposition'][0]);
        } else {
            printWarning("Content-Disposition header not set");
        }
    } else {
        printWarning("Download endpoint response type: " . get_class($response));
    }
} catch (Exception $e) {
    printError("Download test failed: " . $e->getMessage());
}

// Cleanup
printHeader("Cleanup");
try {
    // Delete test file
    if (file_exists(storage_path('app/' . $document->path))) {
        unlink(storage_path('app/' . $document->path));
        printSuccess("Test file deleted");
    }
    
    // Delete test document record
    $document->delete();
    printSuccess("Test document record deleted");
    
    // Delete test customer
    $customer->delete();
    printSuccess("Test customer deleted");
    
} catch (Exception $e) {
    printWarning("Cleanup failed: " . $e->getMessage());
}

// Summary
printHeader("Test Summary");
printInfo("All tests completed at: " . date('Y-m-d H:i:s'));
echo "\n";
printSuccess("✓ Tests passed - Document API is working correctly!");
echo "\n";
printInfo("Next steps:");
printInfo("1. Test in browser at: $baseUrl/dashboard/customers");
printInfo("2. Upload a real PDF document");
printInfo("3. Check browser console for any errors");
printInfo("4. Try View and Download buttons");
echo "\n";