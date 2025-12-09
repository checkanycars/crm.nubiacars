# Quick Start Guide - Finance Approval Feature

## 🚀 Quick Setup (5 minutes)

### Step 1: Run Migrations
```bash
cd backend
php artisan migrate
```

### Step 2: Create Finance User
```bash
php artisan db:seed --class=FinanceUserSeeder
```

This creates:
- **Finance User**
  - Email: `finance@nubiacars.com`
  - Password: `password`
  - Role: Finance

- **Updates Sales Users** with default commission rates:
  - Base Commission: 5%
  - Bonus Commission: 2%

### Step 3: Start the Application

**Backend:**
```bash
cd backend
php artisan serve
```

**Frontend:**
```bash
cd frontend
npm run dev
```

## 🎯 Quick Test Flow

### Test Scenario: Complete Lead Approval Flow

#### 1. **Login as Sales User**
- Email: `sales1@example.com` (or your sales user)
- Password: `password`

#### 2. **Convert a Lead**
- Go to **Leads** page
- Find or create a test lead
- Drag lead to **Converted** column or edit status
- **Important:** Set these prices:
  - Selling Price: `50,000 AED`
  - Cost Price: `40,000 AED`
  - Profit: `10,000 AED`

#### 3. **Login as Finance User**
- Logout from sales account
- Email: `finance@nubiacars.com`
- Password: `password`

#### 4. **Review and Approve**
- Click **Finance** in sidebar (💰 icon)
- See the pending approval in **Pending** tab
- Review lead details:
  - Customer name
  - Sales person
  - Car details
  - Selling price: AED 50,000
  - Cost price: AED 40,000
  - **Profit: AED 10,000** (highlighted in green)
- Click **Details** to see full information
- Click **Approve** button
- Confirm approval

#### 5. **Verify Commission Calculation**
Expected commission for sales user:
```
Profit = AED 50,000 - AED 40,000 = AED 10,000
Base Commission = AED 10,000 × 5% = AED 500
Bonus Commission = AED 10,000 × 2% = AED 200
Total Commission = AED 700
```

#### 6. **Mark Commission as Paid**
- Go to **Approved** tab
- Find the approved lead
- Status shows: **Pending** (yellow badge)
- Click **Mark Paid**
- Status changes to: **Paid** (green badge)

## 📊 Finance Dashboard Overview

### Statistics Cards

1. **Pending Approvals** 🕐
   - Number of converted leads waiting for approval
   - Real-time count

2. **Approved Leads** ✅
   - Total approved leads
   - Total value of approved deals

3. **Pending Commission** 💰
   - Number of approved leads with unpaid commission
   - Total pending commission amount

4. **Commission Paid** 📈
   - Total amount of paid commissions
   - Historical tracking

### Three Main Tabs

#### 1. Pending Tab
- Shows all converted leads awaiting approval
- Actions available:
  - **Details**: View complete lead information
  - **Approve**: Approve lead and calculate commission
  - **Reject**: Reject with mandatory reason

#### 2. Approved Tab
- Shows all approved leads
- Commission status: Paid or Pending
- Actions available:
  - **Details**: View lead information
  - **Mark Paid**: Mark commission as paid (if pending)

#### 3. Rejected Tab
- Shows all rejected leads
- Displays rejection reasons
- Actions available:
  - **Details**: View lead and rejection information

## 🔍 Search & Filter Features

### Search Bar
Search across:
- Lead name
- Customer name
- Customer email
- Sales person name
- Car company
- Car model

### Filters (on Approved tab)
- Commission Status: All, Paid, Pending
- Assigned Sales Person

## 💡 Key Features

### Approval Process
✅ **Automatic Commission Calculation**
- Profit calculated automatically
- Commission based on user's rates
- Bonus commission included
- Amount added to sales user instantly

✅ **Rejection with Reason**
- Mandatory rejection reason
- Reason visible to sales user
- No commission calculated

✅ **Audit Trail**
- Timestamp recorded
- Approver/rejecter tracked
- Cannot be modified once processed

### Commission Management
- Track paid vs pending commissions
- Mark commissions as paid individually
- View total commission amounts
- Filter by payment status

## 🔐 Security Features

- **Role-Based Access**: Only finance users can access
- **One-Time Processing**: Leads cannot be approved/rejected twice
- **Validation**: Must be converted status before approval
- **Authorization**: Checked on every API request

## 📝 Common Scenarios

### Scenario 1: High-Value Deal
```
Lead: BMW X5 2024
Selling Price: AED 100,000
Cost Price: AED 85,000
Profit: AED 15,000

Sales User Commission (5%): AED 750
Sales User Bonus (2%): AED 300
Total Commission: AED 1,050
```
**Action**: Approve and mark as paid after processing

### Scenario 2: Low Profit Deal
```
Lead: Toyota Corolla 2023
Selling Price: AED 25,000
Cost Price: AED 24,000
Profit: AED 1,000

Sales User Commission (5%): AED 50
Sales User Bonus (2%): AED 20
Total Commission: AED 70
```
**Decision**: Finance can review if profit margin is acceptable

### Scenario 3: Suspicious Deal
```
Lead: Mercedes S-Class 2024
Selling Price: AED 120,000
Cost Price: AED 110,000
Profit: AED 10,000 (seems low for luxury car)
```
**Action**: Reject with reason: "Profit margin too low for luxury segment. Please verify pricing."

## 🎨 UI Guide

### Color Coding
- **Green** ✅: Approved, Paid, Positive profit
- **Red** ❌: Rejected, Negative profit
- **Yellow** ⏳: Pending approval/payment
- **Blue** ℹ️: Information, Details

### Button Actions
- **Approve** (Green): Process approval + calculate commission
- **Reject** (Red): Reject with reason
- **Details** (Outline): View full information
- **Mark Paid** (Primary): Mark commission as paid

## 🐛 Troubleshooting

### Issue: Finance menu not visible
**Solution**: 
- Verify user has `finance` role in database
- Clear browser cache
- Re-login

### Issue: Cannot approve lead
**Check**:
- Lead status is "converted"
- Lead hasn't been processed already
- User has finance role
- Selling and cost prices are set

### Issue: Commission not calculated
**Verify**:
- Sales user has commission rates set
- Selling price > 0
- Cost price > 0
- Lead was approved (not rejected)

### Issue: Search not working
**Try**:
- Check spelling
- Use partial terms
- Try different search criteria
- Refresh the page

## 📞 Support Commands

### Check Finance User
```bash
php artisan tinker
```
```php
User::where('role', 'finance')->get();
```

### Check Lead Status
```php
Lead::with(['assignedUser', 'approvedBy'])->find(LEAD_ID);
```

### Check Commission Rates
```php
User::where('role', 'sales')->get(['name', 'commission', 'bonus_commission']);
```

### Reset Test Data
```php
// Reset finance approvals (careful!)
Lead::where('status', 'converted')->update([
    'finance_approved' => null,
    'approved_by' => null,
    'approved_at' => null,
    'rejection_reason' => null,
    'commission_paid' => false
]);
```

## 📚 Next Steps

1. ✅ Test with real data
2. ✅ Configure commission rates for all sales users
3. ✅ Train finance team on approval process
4. ✅ Set up reporting and analytics
5. ✅ Implement email notifications (future)

## 🎓 Training Checklist

For Finance Users:
- [ ] Login with finance credentials
- [ ] Navigate to Finance page
- [ ] Review pending approvals
- [ ] Approve a test lead
- [ ] Reject a test lead with reason
- [ ] Mark commission as paid
- [ ] Use search and filters
- [ ] Review statistics dashboard

For Sales Users:
- [ ] Convert a lead with prices
- [ ] Check approval status
- [ ] View commission balance
- [ ] Understand rejection reasons

For Managers:
- [ ] Monitor finance activity
- [ ] Track team performance
- [ ] Review approval rates
- [ ] Analyze commission data

---

**Need Help?** Check `FINANCE_FEATURE.md` for complete documentation.

**Version:** 1.0.0
**Last Updated:** December 2025