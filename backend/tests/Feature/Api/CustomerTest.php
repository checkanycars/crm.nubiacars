<?php

use App\CustomerStatus;
use App\Models\Customer;
use App\Models\User;
use App\UserRole;
use Illuminate\Foundation\Testing\RefreshDatabase;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\assertDatabaseHas;
use function Pest\Laravel\assertDatabaseMissing;
use function Pest\Laravel\deleteJson;
use function Pest\Laravel\getJson;
use function Pest\Laravel\postJson;
use function Pest\Laravel\putJson;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create(['role' => UserRole::Manager]);
});

describe('Customer API', function () {
    test('unauthenticated users cannot access customer endpoints', function () {
        getJson('/api/customers')->assertUnauthorized();
        postJson('/api/customers')->assertUnauthorized();
        getJson('/api/customers/1')->assertUnauthorized();
        putJson('/api/customers/1')->assertUnauthorized();
        deleteJson('/api/customers/1')->assertUnauthorized();
    });

    describe('index', function () {
        test('can list all customers', function () {
            Customer::factory()->count(3)->create();

            $response = actingAs($this->user)->getJson('/api/customers');

            $response->assertSuccessful()
                ->assertJsonStructure([
                    'data' => [
                        '*' => [
                            'id',
                            'fullName',
                            'email',
                            'phone',
                            'status',
                            'notes',
                            'createdAt',
                            'updatedAt',
                        ],
                    ],
                    'links',
                    'meta',
                ]);

            expect($response->json('data'))->toHaveCount(3);
        });

        test('can filter customers by status', function () {
            Customer::factory()->lead()->count(2)->create();
            Customer::factory()->active()->count(3)->create();

            $response = actingAs($this->user)->getJson('/api/customers?status=lead');

            $response->assertSuccessful();
            expect($response->json('data'))->toHaveCount(2);
            expect($response->json('data.0.status'))->toBe('lead');
        });

        test('can search customers by full name', function () {
            Customer::factory()->create(['full_name' => 'John Doe']);
            Customer::factory()->create(['full_name' => 'Jane Smith']);

            $response = actingAs($this->user)->getJson('/api/customers?search=John');

            $response->assertSuccessful();
            expect($response->json('data'))->toHaveCount(1);
            expect($response->json('data.0.fullName'))->toBe('John Doe');
        });

        test('can search customers by email', function () {
            Customer::factory()->create(['email' => 'john@example.com']);
            Customer::factory()->create(['email' => 'jane@example.com']);

            $response = actingAs($this->user)->getJson('/api/customers?search=john@example');

            $response->assertSuccessful();
            expect($response->json('data'))->toHaveCount(1);
            expect($response->json('data.0.email'))->toBe('john@example.com');
        });

        test('can search customers by phone', function () {
            Customer::factory()->create(['phone' => '+1234567890']);
            Customer::factory()->create(['phone' => '+9876543210']);

            $response = actingAs($this->user)->getJson('/api/customers?search=+123456');

            $response->assertSuccessful();
            expect($response->json('data'))->toHaveCount(1);
            expect($response->json('data.0.phone'))->toBe('+1234567890');
        });

        test('can sort customers by field', function () {
            Customer::factory()->create(['full_name' => 'Zack']);
            Customer::factory()->create(['full_name' => 'Adam']);

            $response = actingAs($this->user)->getJson('/api/customers?sort_by=full_name&sort_direction=asc');

            $response->assertSuccessful();
            expect($response->json('data.0.fullName'))->toBe('Adam');
            expect($response->json('data.1.fullName'))->toBe('Zack');
        });

        test('can paginate customers', function () {
            Customer::factory()->count(20)->create();

            $response = actingAs($this->user)->getJson('/api/customers?per_page=5');

            $response->assertSuccessful();
            expect($response->json('data'))->toHaveCount(5);
            expect($response->json('meta.per_page'))->toBe(5);
        });
    });

    describe('store', function () {
        test('can create a new customer', function () {
            $customerData = [
                'full_name' => 'John Doe',
                'email' => 'john.doe@example.com',
                'phone' => '+1234567890',
                'status' => 'lead',
                'notes' => 'Interested in buying a car',
            ];

            $response = actingAs($this->user)->postJson('/api/customers', $customerData);

            $response->assertCreated()
                ->assertJsonStructure([
                    'message',
                    'data' => [
                        'id',
                        'fullName',
                        'email',
                        'phone',
                        'status',
                        'notes',
                        'createdAt',
                        'updatedAt',
                    ],
                ])
                ->assertJson([
                    'message' => 'Customer created successfully.',
                    'data' => [
                        'fullName' => 'John Doe',
                        'email' => 'john.doe@example.com',
                        'phone' => '+1234567890',
                        'status' => 'lead',
                        'notes' => 'Interested in buying a car',
                    ],
                ]);

            assertDatabaseHas('customers', [
                'full_name' => 'John Doe',
                'email' => 'john.doe@example.com',
                'phone' => '+1234567890',
                'status' => 'lead',
            ]);
        });

        test('can create a customer without notes', function () {
            $customerData = [
                'full_name' => 'Jane Smith',
                'email' => 'jane@example.com',
                'phone' => '+9876543210',
                'status' => 'active',
            ];

            $response = actingAs($this->user)->postJson('/api/customers', $customerData);

            $response->assertCreated()
                ->assertJson([
                    'data' => [
                        'fullName' => 'Jane Smith',
                        'notes' => null,
                    ],
                ]);
        });

        test('requires full name to create customer', function () {
            $customerData = [
                'email' => 'test@example.com',
                'phone' => '+1234567890',
                'status' => 'lead',
            ];

            $response = actingAs($this->user)->postJson('/api/customers', $customerData);

            $response->assertUnprocessable()
                ->assertJsonValidationErrors(['full_name']);
        });

        test('requires email to create customer', function () {
            $customerData = [
                'full_name' => 'John Doe',
                'phone' => '+1234567890',
                'status' => 'lead',
            ];

            $response = actingAs($this->user)->postJson('/api/customers', $customerData);

            $response->assertUnprocessable()
                ->assertJsonValidationErrors(['email']);
        });

        test('requires valid email format', function () {
            $customerData = [
                'full_name' => 'John Doe',
                'email' => 'invalid-email',
                'phone' => '+1234567890',
                'status' => 'lead',
            ];

            $response = actingAs($this->user)->postJson('/api/customers', $customerData);

            $response->assertUnprocessable()
                ->assertJsonValidationErrors(['email']);
        });

        test('requires phone to create customer', function () {
            $customerData = [
                'full_name' => 'John Doe',
                'email' => 'john@example.com',
                'status' => 'lead',
            ];

            $response = actingAs($this->user)->postJson('/api/customers', $customerData);

            $response->assertUnprocessable()
                ->assertJsonValidationErrors(['phone']);
        });

        test('requires status to create customer', function () {
            $customerData = [
                'full_name' => 'John Doe',
                'email' => 'john@example.com',
                'phone' => '+1234567890',
            ];

            $response = actingAs($this->user)->postJson('/api/customers', $customerData);

            $response->assertUnprocessable()
                ->assertJsonValidationErrors(['status']);
        });

        test('validates status is a valid enum value', function () {
            $customerData = [
                'full_name' => 'John Doe',
                'email' => 'john@example.com',
                'phone' => '+1234567890',
                'status' => 'invalid-status',
            ];

            $response = actingAs($this->user)->postJson('/api/customers', $customerData);

            $response->assertUnprocessable()
                ->assertJsonValidationErrors(['status']);
        });

        test('validates full name does not exceed 255 characters', function () {
            $customerData = [
                'full_name' => str_repeat('a', 256),
                'email' => 'john@example.com',
                'phone' => '+1234567890',
                'status' => 'lead',
            ];

            $response = actingAs($this->user)->postJson('/api/customers', $customerData);

            $response->assertUnprocessable()
                ->assertJsonValidationErrors(['full_name']);
        });

        test('validates phone does not exceed 20 characters', function () {
            $customerData = [
                'full_name' => 'John Doe',
                'email' => 'john@example.com',
                'phone' => str_repeat('1', 21),
                'status' => 'lead',
            ];

            $response = actingAs($this->user)->postJson('/api/customers', $customerData);

            $response->assertUnprocessable()
                ->assertJsonValidationErrors(['phone']);
        });
    });

    describe('show', function () {
        test('can retrieve a specific customer', function () {
            $customer = Customer::factory()->create([
                'full_name' => 'John Doe',
                'email' => 'john@example.com',
            ]);

            $response = actingAs($this->user)->getJson("/api/customers/{$customer->id}");

            $response->assertSuccessful()
                ->assertJsonStructure([
                    'data' => [
                        'id',
                        'fullName',
                        'email',
                        'phone',
                        'status',
                        'notes',
                        'createdAt',
                        'updatedAt',
                    ],
                ])
                ->assertJson([
                    'data' => [
                        'id' => $customer->id,
                        'fullName' => 'John Doe',
                        'email' => 'john@example.com',
                    ],
                ]);
        });

        test('returns 404 for non-existent customer', function () {
            $response = actingAs($this->user)->getJson('/api/customers/99999');

            $response->assertNotFound();
        });
    });

    describe('update', function () {
        test('can update a customer', function () {
            $customer = Customer::factory()->create([
                'full_name' => 'John Doe',
                'status' => CustomerStatus::Lead,
            ]);

            $updateData = [
                'full_name' => 'John Updated',
                'status' => 'active',
            ];

            $response = actingAs($this->user)->putJson("/api/customers/{$customer->id}", $updateData);

            $response->assertSuccessful()
                ->assertJson([
                    'message' => 'Customer updated successfully.',
                    'data' => [
                        'id' => $customer->id,
                        'fullName' => 'John Updated',
                        'status' => 'active',
                    ],
                ]);

            assertDatabaseHas('customers', [
                'id' => $customer->id,
                'full_name' => 'John Updated',
                'status' => 'active',
            ]);
        });

        test('can partially update a customer', function () {
            $customer = Customer::factory()->create([
                'full_name' => 'John Doe',
                'email' => 'john@example.com',
            ]);

            $updateData = [
                'full_name' => 'Jane Doe',
            ];

            $response = actingAs($this->user)->putJson("/api/customers/{$customer->id}", $updateData);

            $response->assertSuccessful();

            assertDatabaseHas('customers', [
                'id' => $customer->id,
                'full_name' => 'Jane Doe',
                'email' => 'john@example.com',
            ]);
        });

        test('validates email format when updating', function () {
            $customer = Customer::factory()->create();

            $updateData = [
                'email' => 'invalid-email',
            ];

            $response = actingAs($this->user)->putJson("/api/customers/{$customer->id}", $updateData);

            $response->assertUnprocessable()
                ->assertJsonValidationErrors(['email']);
        });

        test('validates status is valid enum when updating', function () {
            $customer = Customer::factory()->create();

            $updateData = [
                'status' => 'invalid-status',
            ];

            $response = actingAs($this->user)->putJson("/api/customers/{$customer->id}", $updateData);

            $response->assertUnprocessable()
                ->assertJsonValidationErrors(['status']);
        });

        test('returns 404 when updating non-existent customer', function () {
            $updateData = [
                'full_name' => 'Test',
            ];

            $response = actingAs($this->user)->putJson('/api/customers/99999', $updateData);

            $response->assertNotFound();
        });
    });

    describe('destroy', function () {
        test('can delete a customer', function () {
            $customer = Customer::factory()->create();

            $response = actingAs($this->user)->deleteJson("/api/customers/{$customer->id}");

            $response->assertSuccessful()
                ->assertJson([
                    'message' => 'Customer deleted successfully.',
                ]);

            assertDatabaseMissing('customers', [
                'id' => $customer->id,
            ]);
        });

        test('returns 404 when deleting non-existent customer', function () {
            $response = actingAs($this->user)->deleteJson('/api/customers/99999');

            $response->assertNotFound();
        });
    });
});
