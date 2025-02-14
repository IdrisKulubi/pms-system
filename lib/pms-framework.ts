export interface PPSGoal {
  description: string;
  verification: string;
  weight: number;
}
export interface Feedback {
  reviewer: string;
  rating: number;
  comment: string;
  comments?: string;
  overrideComment?: string;
  approved: boolean;
}
export interface KPI {
  name: string;
  goals: PPSGoal[];
  totalWeight: number;
}

export interface Pillar {
  name: string;
  kpis: KPI[];
  totalWeight: number;
}

export const pmsFramework: Pillar[] = [
  {
    name: "Branding",
    kpis: [
      {
        name: "Innovation & Efficiency",
        goals: [
          {
            description: "Enhance existing systems and develop user-friendly MIS systems",
            verification: "Tools and systems in place",
            weight: 3
          }
        ],
        totalWeight: 3
      },
      {
        name: "Events and conferences",
        goals: [
          {
            description: "Participate and present in conferences, seminars and workshop that provide greater visibility of our offerings - at least 3",
            verification: "Attendance of events and create at least 3 leads and partnerships",
            weight: 1
          }
        ],
        totalWeight: 1
      },
      {
        name: "Thought Leadership",
        goals: [
          {
            description: "Review, leverage and distribute all relevant global thought leadership in the local market within area of specialisation",
            verification: "Reposting key thought leadership posts within the organization",
            weight: 1
          }
        ],
        totalWeight: 1
      }
    ],
    totalWeight: 5
  },
  {
    name: "Clients",
    kpis: [
      {
        name: "Client Relationship",
        goals: [
          {
            description: "Ensure adherence to financial terms in client contracts, including payment terms, reimbursements, and financial reporting obligations",
            verification: "Compliance with client contracts",
            weight: 1
          }
        ],
        totalWeight: 1
      },
      {
        name: "Business Development",
        goals: [
          {
            description: "At least 15% of the Finance Department's time shall be dedicated to business development by assisting the team with compliance matters, preparing accurate and competitive financial proposals, and supporting prequalification processes",
            verification: "BD dashboard and timesheet reports",
            weight: 3
          }
        ],
        totalWeight: 3
      },
      {
        name: "Client feedback",
        goals: [
          {
            description: "Addressing client concerns or issues related to financial processes within a predefined turnaround time",
            verification: "Timely Response to Feedback",
            weight: 1
          }
        ],
        totalWeight: 1
      }
    ],
    totalWeight: 5
  },
  {
    name: "Financials",
    kpis: [
      {
        name: "Cash flow Management",
        goals: [
          {
            description: "Maintain a cash reserve for at least 2 months",
            verification: "Cashflow reports, timely billings and annual average collection rate of 85%",
            weight: 5
          }
        ],
        totalWeight: 5
      },
      {
        name: "Mobilization fees",
        goals: [
          {
            description: "15-20% mobilisation fees on signing the contract",
            verification: "Billing reports and follow up efforts",
            weight: 5
          }
        ],
        totalWeight: 5
      },
      {
        name: "Oversee Audit Process",
        goals: [
          {
            description: "Ensure thorough preparation and collaboration with auditors for a successful audit process",
            verification: "Complete preparation of all required financial and operational documents by for IACL Q2 2025 and KCL by Q1 and Address 100% of audit recommendations within 3 months",
            weight: 5
          }
        ],
        totalWeight: 5
      },
      {
        name: "Asset Managements",
        goals: [
          {
            description: "Zero Loss of the company assets",
            verification: "Insurance certificates and Digitization of Asset management software",
            weight: 1
          }
        ],
        totalWeight: 1
      },
      {
        name: "Financial Reporting",
        goals: [
          {
            description: "Ensure the reporting is done on a timely manner",
            verification: "Monthly management reports by 2nd week of the month",
            weight: 4
          }
        ],
        totalWeight: 4
      },
      {
        name: "Contractual terms and conditions",
        goals: [
          {
            description: "Ensure invoices are raised on a timely basis as per the engagement letter",
            verification: "Receivables analysis report and collection rate of 85%",
            weight: 5
          }
        ],
        totalWeight: 5
      },
      {
        name: "Budget management and Cost Management",
        goals: [
          {
            description: "Ensure direct staff costs and direct overhead costs are within the budget and ensure average recovery of 30%",
            verification: "Actual Vs Budget analysis reports",
            weight: 5
          }
        ],
        totalWeight: 5
      }
    ],
    totalWeight: 30
  },
  {
    name: "Internal Processes & Systems",
    kpis: [
      {
        name: "Data management",
        goals: [
          {
            description: "Data Centralizations of key information for the company",
            verification: "Ease of access of Data and Employee surveys",
            weight: 5
          }
        ],
        totalWeight: 5
      },
      {
        name: "Leave management",
        goals: [
          {
            description: "Manage own leave and of those working under me to ensure minimum disruption of engagements and ensure not more than five days are carried forward",
            verification: "Leave management reports for each employees",
            weight: 5
          }
        ],
        totalWeight: 5
      },
      {
        name: "Policies Awareness",
        goals: [
          {
            description: "Ensure all staff are aware of all the policies in place",
            verification: "Development of LMS within the organization and 80% completion of modules",
            weight: 10
          }
        ],
        totalWeight: 10
      },
      {
        name: "Timesheets",
        goals: [
          {
            description: "Digitization of timesheet Management system and ensure proper utilization of the systems through training",
            verification: "Staff utilization reports at 100%",
            weight: 5
          }
        ],
        totalWeight: 5
      },
      {
        name: "Performance Management System",
        goals: [
          {
            description: "PMS launch and ensure the reviews are done twice a year",
            verification: "Appraisal reports",
            weight: 10
          }
        ],
        totalWeight: 10
      },
      {
        name: "Ensure Compliance with Labor Laws",
        goals: [
          {
            description: "Adhere to all statutory labor regulations and best practices",
            verification: "Conduct an annual HR compliance audit and score atleast 80%",
            weight: 5
          }
        ],
        totalWeight: 5
      },
      {
        name: "Enhance Compliance & Risk Management",
        goals: [
          {
            description: "Ensure all the policies are in place and adhered too",
            verification: "100% compliance with tax and other regulatory bodies",
            weight: 5
          }
        ],
        totalWeight: 5
      }
    ],
    totalWeight: 45
  },
  {
    name: "People and Culture",
    kpis: [
      {
        name: "Learning & Development",
        goals: [
          {
            description: "Identify skills gaps and recommend appropriate training for team at the beginning of the year",
            verification: "Development of Assessment skill matrix for the organization",
            weight: 3
          },
          {
            description: "Ensure each team members achieve a minimum of 50 CPD hours requirements",
            verification: "Certificates from the relevant trainings and inhouse attendance list",
            weight: 3
          }
        ],
        totalWeight: 6
      },
      {
        name: "Bank Relationship",
        goals: [
          {
            description: "Sign up unsecured lending scheme with the bank",
            verification: "Sign up agreement",
            weight: 2
          }
        ],
        totalWeight: 2
      },
      {
        name: "Employee Satisfaction",
        goals: [
          {
            description: "Maintain employee satisfactions of 95% and process flow of onboarding and seperation process followed",
            verification: "Employee satisfaction surveys",
            weight: 2
          }
        ],
        totalWeight: 2
      },
      {
        name: "Team retention ratios",
        goals: [
          {
            description: "Retention Rate of employees at 90%",
            verification: "Retention rate Matrix at the end of the year",
            weight: 1
          }
        ],
        totalWeight: 1
      },
      {
        name: "Trainings",
        goals: [
          {
            description: "Conduct one external training per quarter",
            verification: "Training Reports from the trainers and feedback evaluation from the staff",
            weight: 2
          }
        ],
        totalWeight: 2
      },
      {
        name: "Adherence to Values",
        goals: [
          {
            description: "Demonstrates unwavering commitment to the company's core values in all decision-making and actions",
            verification: "Minimal or no verbal complain form the line manager or no warning",
            weight: 2
          }
        ],
        totalWeight: 2
      }
    ],
    totalWeight: 15
  }
]; 