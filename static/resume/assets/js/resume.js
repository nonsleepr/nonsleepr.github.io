// Configuration options
const config = {
    showSkillCategories: false // Set to true to show skill categories
};

// DOM Elements
const loadingEl = document.getElementById('loading');
const errorEl = document.getElementById('error');
const resumeContentEl = document.getElementById('resume-content');
const profileSectionEl = document.getElementById('profile-section');
const contactSectionEl = document.getElementById('contact-section');
const skillsSectionEl = document.getElementById('skills-section');
const educationSectionEl = document.getElementById('education-section');
const summarySectionEl = document.getElementById('summary-section');
const workSectionEl = document.getElementById('work-section');
const projectsSectionEl = document.getElementById('projects-section');
const awardsSectionEl = document.getElementById('awards-section');

// Print function
document.getElementById('print-button').addEventListener('click', () => {
    window.print();
});

// Utility functions from formatters.js
/**
 * Format a date string to a readable format
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date string
 */
function formatDate(dateString) {
    if (!dateString) return 'Present';
    
    const date = new Date(dateString);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
}

/**
 * Format a date range from start and end dates
 * @param {string} startDate - ISO date string for start date
 * @param {string} endDate - ISO date string for end date
 * @returns {string} Formatted date range
 */
function formatDateRange(startDate, endDate) {
    return `${formatDate(startDate)} – ${formatDate(endDate)}`;
}

/**
 * Format a location object to a string
 * @param {Object} location - Location object
 * @returns {string} Formatted location string
 */
function formatLocation(location) {
    if (!location) return '';
    
    return [
        location.city,
        location.region,
        location.countryCode
    ].filter(Boolean).join(', ');
}

/**
 * Format award date
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted year
 */
function formatAwardDate(dateString) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.getFullYear();
}

// Render functions for each section
function renderProfile(basics) {
    if (!basics) return;
    
    // Clear previous content
    profileSectionEl.innerHTML = '';
    
    // Create image element
    const img = document.createElement('img');
    img.src = basics.image || "https://placehold.co/120x120/e2e8f0/334155?text=JD";
    img.alt = basics.name || "Profile";
    img.className = "profile-photo w-36 h-36 mx-auto mb-4 rounded-full border-4 border-[var(--blue)] shadow-md";
    
    // Create name heading
    const h1 = document.createElement('h1');
    h1.className = "font-bold text-2xl";
    h1.textContent = basics.name || "Name";
    
    // Create title paragraph
    const p = document.createElement('p');
    p.className = "italic";
    p.textContent = basics.label || "Title";
    
    // Append elements to the section
    profileSectionEl.appendChild(img);
    profileSectionEl.appendChild(h1);
    profileSectionEl.appendChild(p);
}

function renderContact(basics) {
    if (!basics) return;
    
    // Clear previous content
    contactSectionEl.innerHTML = '';
    
    // Create heading
    const h2 = document.createElement('h2');
    h2.className = "text-xl font-bold section-header pb-1 mb-4 print:text-xl";
    h2.textContent = "Contact";
    contactSectionEl.appendChild(h2);
    
    // Create list
    const ul = document.createElement('ul');
    ul.className = "space-y-2 text-sm";
    
    // Add phone
    if (basics.phone) {
        const li = document.createElement('li');
        const strong = document.createElement('strong');
        strong.textContent = "Phone:";
        li.appendChild(strong);
        li.appendChild(document.createTextNode(" "));
        
        const a = document.createElement('a');
        a.href = `tel:${basics.phone}`;
        a.className = "text-[var(--blue)] no-underline";
        a.textContent = basics.phone;
        li.appendChild(a);
        ul.appendChild(li);
    }
    
    // Add email
    if (basics.email) {
        const li = document.createElement('li');
        const strong = document.createElement('strong');
        strong.textContent = "Email:";
        li.appendChild(strong);
        li.appendChild(document.createTextNode(" "));
        
        const a = document.createElement('a');
        a.href = `mailto:${basics.email}`;
        a.className = "text-[var(--blue)] no-underline";
        a.textContent = basics.email;
        li.appendChild(a);
        ul.appendChild(li);
    }
    
    // Add website
    if (basics.url) {
        const li = document.createElement('li');
        const strong = document.createElement('strong');
        strong.textContent = "Website:";
        li.appendChild(strong);
        li.appendChild(document.createTextNode(" "));
        
        const a = document.createElement('a');
        a.href = basics.url;
        a.className = "text-[var(--blue)] no-underline";
        a.textContent = basics.url.replace(/^https?:\/\//, '');
        li.appendChild(a);
        ul.appendChild(li);
    }
    
    // Add location
    if (basics.location) {
        const li = document.createElement('li');
        const strong = document.createElement('strong');
        strong.textContent = "Location:";
        li.appendChild(strong);
        li.appendChild(document.createTextNode(" "));
        li.appendChild(document.createTextNode(formatLocation(basics.location)));
        ul.appendChild(li);
    }
    
    // Add profiles
    if (basics.profiles && basics.profiles.length > 0) {
        basics.profiles.forEach(profile => {
            const li = document.createElement('li');
            const strong = document.createElement('strong');
            strong.textContent = profile.network + ":";
            li.appendChild(strong);
            li.appendChild(document.createTextNode(" "));
            
            const a = document.createElement('a');
            a.href = profile.url;
            a.className = "text-[var(--blue)] no-underline";
            a.textContent = profile.username;
            li.appendChild(a);
            ul.appendChild(li);
        });
    }
    
    contactSectionEl.appendChild(ul);
}

function renderSkills(skills) {
    // Clear previous content
    skillsSectionEl.innerHTML = '';
    
    // Create heading
    const h2 = document.createElement('h2');
    h2.className = "text-xl font-bold section-header pb-1 mb-4 print:text-xl";
    h2.textContent = "Skills";
    skillsSectionEl.appendChild(h2);
    
    // Create container
    const container = document.createElement('div');
    container.className = "space-y-3";
    
    if (config.showSkillCategories) {
        // Group skills by category
        const skillsByCategory = skills.reduce((categories, skill) => {
            if (skill.name && skill.keywords) {
                categories[skill.name] = skill.keywords;
            }
            return categories;
        }, {});
        
        const categories = Object.entries(skillsByCategory);
        
        if (categories.length > 0) {
            categories.forEach(([category, keywords]) => {
                const div = document.createElement('div');
                
                const h3 = document.createElement('h3');
                h3.className = "font-medium subheading mb-1";
                h3.textContent = category + ":";
                div.appendChild(h3);
                
                const p = document.createElement('p');
                
                keywords.forEach(keyword => {
                    const span = document.createElement('span');
                    span.className = "skill-tag";
                    span.textContent = keyword;
                    p.appendChild(span);
                });
                
                div.appendChild(p);
                container.appendChild(div);
            });
        } else {
            const div = document.createElement('div');
            const p = document.createElement('p');
            p.textContent = "No skills listed";
            div.appendChild(p);
            container.appendChild(div);
        }
    } else {
        // Flatten all skills into a single array
        const flattenedSkills = skills.reduce((allSkills, skill) => {
            if (skill.keywords) {
                allSkills.push(...skill.keywords);
            }
            return allSkills;
        }, []);
        
        const div = document.createElement('div');
        const p = document.createElement('p');
        
        if (flattenedSkills.length > 0) {
            flattenedSkills.forEach(skill => {
                const span = document.createElement('span');
                span.className = "skill-tag";
                span.textContent = skill;
                p.appendChild(span);
            });
        } else {
            p.textContent = "No skills listed";
        }
        
        div.appendChild(p);
        container.appendChild(div);
    }
    
    skillsSectionEl.appendChild(container);
}

function renderEducation(education) {
    // Clear previous content
    educationSectionEl.innerHTML = '';
    
    // Create heading
    const h2 = document.createElement('h2');
    h2.className = "text-xl font-bold section-header pb-1 mb-4 print:text-xl";
    h2.textContent = "Education";
    educationSectionEl.appendChild(h2);
    
    // Create container
    const container = document.createElement('div');
    container.className = "space-y-2";
    
    if (education.length > 0) {
        education.forEach(edu => {
            const div = document.createElement('div');
            
            const h3 = document.createElement('h3');
            h3.className = "job-title font-semibold";
            h3.textContent = `${edu.studyType} ${edu.area}`;
            div.appendChild(h3);
            
            const p = document.createElement('p');
            p.className = "italic";
            
            const a = document.createElement('a');
            a.className = "text-sm font-medium";
            if (edu.url) a.href = edu.url;
            a.textContent = edu.institution;
            p.appendChild(a);
            
            p.appendChild(document.createTextNode(` | ${formatDate(edu.startDate)}${edu.endDate ? `-${formatDate(edu.endDate)}` : ''}`));
            div.appendChild(p);
            
            if (edu.score) {
                const scoreP = document.createElement('p');
                scoreP.textContent = `GPA: ${edu.score}`;
                div.appendChild(scoreP);
            }
            
            container.appendChild(div);
        });
    } else {
        const div = document.createElement('div');
        const p = document.createElement('p');
        p.textContent = "No education listed";
        div.appendChild(p);
        container.appendChild(div);
    }
    
    educationSectionEl.appendChild(container);
}

function renderSummary(basics) {
    // Clear previous content
    summarySectionEl.innerHTML = '';
    
    // Create heading
    const h2 = document.createElement('h2');
    h2.className = "text-xl font-bold section-header pb-1 mb-4 print:text-xl";
    h2.textContent = "Summary";
    summarySectionEl.appendChild(h2);
    
    // Create summary paragraph
    const p = document.createElement('p');
    p.textContent = basics.summary || "No summary provided.";
    summarySectionEl.appendChild(p);
}

function renderWorkExperience(work) {
    if (work.length > 0) {
        // Clear previous content
        workSectionEl.innerHTML = '';
        
        // Create heading
        const h2 = document.createElement('h2');
        h2.className = "text-xl font-bold section-header pb-1 mt-6 mb-4";
        h2.textContent = "Work Experience";
        workSectionEl.appendChild(h2);
        
        work.forEach(job => {
            const div = document.createElement('div');
            div.className = `employer-block mb-6${job.highlights && job.highlights.length > 10 ? " large-block" : ""}`;
            
            const h3 = document.createElement('h3');
            h3.className = "text-md font-semibold job-title";
            h3.textContent = job.position;
            div.appendChild(h3);
            
            const p = document.createElement('p');
            p.className = "text-sm italic date font-medium";
            
            const a = document.createElement('a');
            if (job.url) a.href = job.url;
            a.textContent = job.name;
            p.appendChild(a);
            
            p.appendChild(document.createTextNode(` | ${formatDateRange(job.startDate, job.endDate)}`));
            div.appendChild(p);
            
            const ul = document.createElement('ul');
            ul.className = "list-disc pl-5 mt-2 space-y-1";
            
            if (job.summary) {
                const li = document.createElement('li');
                li.textContent = job.summary;
                ul.appendChild(li);
            }
            
            if (job.highlights && job.highlights.length > 0) {
                job.highlights.forEach(highlight => {
                    const li = document.createElement('li');
                    li.textContent = highlight;
                    ul.appendChild(li);
                });
            }
            
            div.appendChild(ul);
            workSectionEl.appendChild(div);
        });
    }
}

function renderProjects(projects) {
    if (projects && projects.length > 0) {
        // Clear previous content
        projectsSectionEl.innerHTML = '';
        
        // Create heading
        const h2 = document.createElement('h2');
        h2.className = "text-xl font-bold section-header pb-1 mt-6 mb-4";
        h2.textContent = "Projects";
        projectsSectionEl.appendChild(h2);
        
        projects.forEach(project => {
            const div = document.createElement('div');
            div.className = "employer-block mb-6";
            
            const h3 = document.createElement('h3');
            h3.className = "text-md font-semibold job-title";
            h3.textContent = project.name;
            div.appendChild(h3);
            
            const p = document.createElement('p');
            p.className = "text-sm date font-medium";
            
            if (project.startDate || project.endDate) {
                p.appendChild(document.createTextNode(`${formatDateRange(project.startDate, project.endDate)} | `));
            }
            
            if (project.url) {
                const a = document.createElement('a');
                a.href = project.url;
                a.className = "hover:underline";
                a.textContent = project.url;
                p.appendChild(a);
            }
            
            div.appendChild(p);
            
            const ul = document.createElement('ul');
            ul.className = "list-disc pl-5 mt-2 space-y-1";
            
            if (project.description) {
                const li = document.createElement('li');
                li.textContent = project.description;
                ul.appendChild(li);
            }
            
            if (project.highlights && project.highlights.length > 0) {
                project.highlights.forEach(highlight => {
                    const li = document.createElement('li');
                    li.textContent = highlight;
                    ul.appendChild(li);
                });
            }
            
            div.appendChild(ul);
            projectsSectionEl.appendChild(div);
        });
    }
}

function renderAwards(awards) {
    if (awards && awards.length > 0) {
        // Clear previous content
        awardsSectionEl.innerHTML = '';
        
        // Create heading
        const h2 = document.createElement('h2');
        h2.className = "text-xl font-bold section-header pb-1 mt-6 mb-4 print:text-xl";
        h2.textContent = "Awards and Recognition";
        awardsSectionEl.appendChild(h2);
        
        // Create list
        const ul = document.createElement('ul');
        ul.className = "list-disc pl-5 space-y-1";
        
        awards.forEach(award => {
            const li = document.createElement('li');
            
            // Add title and awarder
            li.textContent = `${award.title}, ${award.awarder}`;
            
            // Add date if available
            if (award.date) {
                li.textContent += ` (${formatAwardDate(award.date)})`;
            }
            
            // Add summary if available
            if (award.summary) {
                li.textContent += ` - ${award.summary}`;
            }
            
            ul.appendChild(li);
        });
        
        awardsSectionEl.appendChild(ul);
    }
}

// Fetch and render resume data
async function fetchResumeData() {
    try {
        const allowedVariants = ['se', 'rt', 'default'];
        console.log('Fetching resume data...');
        
        let variant = "default";
        
        // Check if there's an anchor in the URL
        const hash = window.location.hash;
        // If hash exists (e.g., #se), use it to construct a different filename
        if (hash && hash.length > 1) {
            // Remove the # symbol and construct the filename
            if (allowedVariants.includes(hash.substring(1))) {
                variant = hash.substring(1); // Remove the # symbol
            }
        }
        const resumeFile = `../data/${variant}.resume.json`;
        
        console.log(`Loading resume from: ${resumeFile}`);
        const response = await fetch(resumeFile);
        
        if (!response.ok) {
            console.error('Failed to load resume data:', response.status, response.statusText);
            throw new Error(`Failed to load resume data: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        console.log('Resume data loaded:', data);
        renderResume(data);
    } catch (err) {
        console.error('Error loading resume data:', err);
        showError(err.message);
    }
}

function showError(message) {
    loadingEl.style.display = 'none';
    errorEl.textContent = `Error: ${message}`;
    errorEl.style.display = 'block';
}

function renderResume(data) {
    loadingEl.style.display = 'none';
    resumeContentEl.style.display = 'block';
    
    const basics = data.basics || {};
    const skills = data.skills || [];
    const education = data.education || [];
    const work = data.work || [];
    const projects = data.projects || [];
    const awards = data.awards || [];
    
    // Update page title with person's name
    if (basics.name) {
        document.title = "Resume - " + basics.name;
    }
    
    // Render sidebar sections
    renderProfile(basics);
    renderContact(basics);
    renderSkills(skills);
    renderEducation(education);
    
    // Render main content sections
    renderSummary(basics);
    renderWorkExperience(work);
    renderProjects(projects);
    renderAwards(awards);
}

// Start loading data when page loads
document.addEventListener('DOMContentLoaded', fetchResumeData);