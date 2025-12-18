# Clinical Deprescribing System

AI-powered clinical decision support system that helps clinicians safely identify and deprescribe inappropriate medications in older adults.

## Features

- **Patient Intake**: Enter demographics, conditions, and renal function
- **Medication Analysis**: Automated screening against Beers Criteria 2023
- **Risk Scoring**: Fall risk, anticholinergic burden, polypharmacy assessment
- **Smart Recommendations**: Evidence-based deprescribing suggestions with AI
- **Clinician Control**: Full approval workflow with documentation
- **Report Generation**: PDF export for medical records

## Tech Stack

- **Frontend**: React 18 + TypeScript + Material-UI
- **Backend**: Node.js + Express
- **Database**: PostgreSQL
- **AI**: OpenAI GPT-4 for enhanced recommendations
- **Deployment**: Vercel (frontend) + Railway (backend)

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- OpenAI API key

### Installation

```bash
# Clone repository
git clone https://github.com/daminiphrenomed/clinical-deprescribing-system.git
cd clinical-deprescribing-system

# Install dependencies
npm install
cd client && npm install && cd ..

# Set up environment variables
cp .env.example .env
# Edit .env with your credentials

# Run development server
npm run dev
```

### Environment Variables

```
DATABASE_URL=postgresql://user:password@localhost:5432/deprescribing
JWT_SECRET=your-secret-key
OPENAI_API_KEY=your-openai-key
PORT=5000
```

## Usage

1. **Login** as a clinician
2. **Create Patient** profile with demographics
3. **Add Medications** with dosing and indications
4. **Run Analysis** to check against Beers Criteria
5. **Review Recommendations** with evidence citations
6. **Approve/Reject** suggestions with documentation
7. **Export Report** for medical records

## Safety Features

- ✅ No automated prescription changes
- ✅ All recommendations require clinician approval
- ✅ Evidence citations for every suggestion
- ✅ Withdrawal syndrome warnings
- ✅ Complete audit trail

## Clinical Guidelines

- AGS Beers Criteria 2023
- STOPP/START v2
- Canadian Deprescribing Guidelines
- Drug interaction databases

## License

MIT License - See LICENSE file

## Disclaimer

This is a clinical decision support tool. All recommendations must be reviewed and approved by qualified healthcare professionals. Not intended to replace clinical judgment.