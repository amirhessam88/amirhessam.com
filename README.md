<div align="center">
  <a href="https://www.amirhessam.com">
    <img src="assets/img/logo_color_clear.png" alt="Amirhessam Tahmassebi" width="120">
  </a>
</div>

# 🚀 My Personal Academic & Professional Website 🎓✨


## 📋 Table of Contents

- [🚀 My Personal Academic \& Professional Website 🎓✨](#-my-personal-academic--professional-website-)
  - [📋 Table of Contents](#-table-of-contents)
  - [🌟 About](#-about)
  - [🛠️ Tech Stack](#️-tech-stack)
  - [📁 Project Structure](#-project-structure)
  - [🚀 Getting Started](#-getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
  - [📊 Statistics System](#-statistics-system)
    - [How it works:](#how-it-works)
    - [Scripts:](#scripts)
  - [🎨 Features](#-features)
    - [🏠 Homepage](#-homepage)
    - [📚 Publications](#-publications)
    - [🎯 Portfolio](#-portfolio)
    - [📞 Contact](#-contact)
  - [📝 Publications](#-publications-1)
  - [🔧 Scripts](#-scripts)
    - [Statistics Management](#statistics-management)
    - [Cron Job Setup](#cron-job-setup)
  - [🌐 Deployment](#-deployment)
    - [CI/CD Pipeline:](#cicd-pipeline)
    - [Configuration:](#configuration)
  - [📈 Analytics](#-analytics)
  - [🤝 Contributing](#-contributing)
    - [Development Guidelines:](#development-guidelines)
  - [📄 License](#-license)
  - [🙏 Acknowledgments](#-acknowledgments)
  - [📞 Contact 🧑‍💻](#-contact-)

## 🌟 About

This is my personal academic website showcasing my research, publications, and professional journey in the field of machine learning and data science! 🧠💡

The website features:
- 📚 **Research Publications** - Journals, conferences, and dissertations
- 🏆 **Academic Achievements** - Citations, H-index, and research metrics
- 💼 **Professional Experience** - CV, resume, and career highlights
- 🎯 **Portfolio Projects** - Showcasing my work and applications
- 📞 **Contact Information** - Easy ways to get in touch

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Styling**: Bootstrap 5, Custom CSS
- **Icons**: Boxicons, Icofont
- **Animations**: AOS (Animate On Scroll)
- **Backend**: PHP 8.2+
- **Data Processing**: Python 3.10
- **Deployment**: GitHub Actions + FTP
- **Version Control**: Git

## 📁 Project Structure

```
amirhessam.com/
├── 📄 index.html                 # Main homepage
├── 📁 assets/
│   ├── 🎨 css/                   # Stylesheets
│   ├── 📊 data/                  # Statistics and data files
│   ├── 🖼️ img/                   # Images and media
│   │   ├── 📱 apps/              # App screenshots
│   │   ├── 🖼️ portfolio/         # Portfolio images
│   │   ├── 👥 testimonials/      # Testimonial photos
│   │   └── 🚀 ventures/          # Venture logos
│   ├── 📜 js/                    # JavaScript files
│   ├── 🐘 php/                   # PHP scripts
│   │   ├── fetch_citations.php   # Google Scholar scraper
│   │   └── update_stats.php      # Statistics updater
│   ├── 🐚 bash/                  # Bash scripts
│   │   └── update_stats.sh       # Statistics wrapper
│   └── 📦 vendor/                # Third-party libraries
├── 📁 publications/              # Publication pages
│   ├── 📚 books.html
│   ├── 🏛️ conferences.html
│   ├── 🎓 dissertations.html
│   ├── 📖 journals.html
│   └── 📋 posters.html
├── 📁 forms/                     # Contact forms
├── 📁 .github/workflows/         # CI/CD pipelines
└── 📄 README.md                  # This file! 😊
```

## 🚀 Getting Started

### Prerequisites

- 🌐 Web server (Apache/Nginx)
- 🐘 PHP 7.4 or higher
- 🐍 Python 3.10 (for statistics processing)
- 📦 Git

### Installation

1. **Clone the repository** 📥
   ```bash
   git clone https://github.com/amirhessam/amirhessam.com.git
   cd amirhessam.com
   ```

2. **Set up web server** 🌐
   - Point your web server document root to the project directory
   - Ensure PHP is enabled and configured

3. **Configure statistics** 📊
   ```bash
   # Make scripts executable
   chmod +x assets/bash/update_stats.sh
   
   # Run statistics update
   ./assets/bash/update_stats.sh
   ```

4. **Access the website** 🎉
   - Open your browser and navigate to your domain
   - The site should load with all features working!

## 📊 Statistics System

The website includes an automated statistics system that fetches data from Google Scholar! 🤖

### How it works:

1. **🕷️ Web Scraping**: PHP scripts scrape Google Scholar for:
   - 📈 Total citations
   - 📄 Number of papers
   - 🎯 H-index

2. **💾 Data Storage**: Statistics are stored in:
   - `assets/data/stats.json` - Main data file
   - Individual `.txt` files for backward compatibility

3. **🔄 Auto-Update**: Statistics can be updated via:
   - Manual script execution
   - Cron job automation
   - GitHub Actions workflow

### Scripts:

- **`assets/php/fetch_citations.php`** 🌐 - Web API endpoint for live data
- **`assets/php/update_stats.php`** 🔄 - Background statistics updater
- **`assets/bash/update_stats.sh`** 🐚 - Wrapper script for easy execution

## 🎨 Features

### 🏠 Homepage
- **Hero Section** with animated background
- **About Me** with professional photo
- **Statistics Counter** with real-time data
- **Portfolio Showcase** with project highlights
- **Testimonials** from colleagues and mentors
- **Contact Form** for easy communication

### 📚 Publications
- **Organized by Type**: Journals, conferences, books, dissertations
- **Search & Filter**: Easy navigation through research
- **PDF Downloads**: Direct access to papers
- **Citation Metrics**: Real-time statistics

### 🎯 Portfolio
- **Project Showcases** with descriptions and images
- **Technology Stack** for each project
- **Live Demos** where available
- **GitHub Links** for source code

### 📞 Contact
- **Multiple Contact Methods**: Email, LinkedIn, GitHub
- **Contact Form** with validation
- **Location Information**
- **Social Media Links**

## 📝 Publications

The website showcases research across multiple domains:

- 🧠 **Machine Learning** - Deep learning, neural networks
- 📊 **Data Science** - Analytics, visualization
- 🔬 **Research** - Academic papers and publications
- 🏛️ **Conferences** - IEEE, SPIE, ACM presentations
- 📖 **Journals** - Peer-reviewed publications

## 🔧 Scripts

### Statistics Management

```bash
# Update statistics manually
./assets/bash/update_stats.sh

# Run PHP script directly
php assets/php/update_stats.php

# Test web API
curl https://yourdomain.com/assets/php/fetch_citations.php
```

### Cron Job Setup

Add to your crontab for automatic updates:

```bash
# Update statistics daily at 6 AM
0 6 * * * /path/to/amirhessam.com/assets/bash/update_stats.sh
```

## 🌐 Deployment

The website is deployed using GitHub Actions! 🚀

### CI/CD Pipeline:

1. **📝 Code Push** to master branch
2. **🔍 Automated Testing** (if configured)
3. **🚀 FTP Deployment** to web server
4. **✅ Success Notification**

### Configuration:

- **FTP Server**: Configured via GitHub Secrets
- **Deployment**: Automatic on push to master
- **Rollback**: Manual via Git revert

## 📈 Analytics

The website includes:

- **📊 Google Scholar Integration** - Real-time citation metrics
- **📈 Usage Statistics** - Page views and engagement
- **🔍 SEO Optimization** - Meta tags and structured data
- **📱 Mobile Responsive** - Works on all devices

## 🤝 Contributing

Contributions are welcome! 🎉

1. **🍴 Fork** the repository
2. **🌿 Create** a feature branch
3. **✏️ Make** your changes
4. **🧪 Test** thoroughly
5. **📝 Commit** with clear messages
6. **🚀 Push** to your branch
7. **📋 Create** a Pull Request

### Development Guidelines:

- 📝 Use clear, descriptive commit messages
- 🧪 Test all changes before submitting
- 📖 Update documentation as needed
- 🎨 Follow existing code style
- 🔍 Add comments for complex logic

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **👨‍🏫 Mentors** - For guidance and support
- **👥 Colleagues** - For collaboration and feedback
- **🌐 Open Source Community** - For amazing tools and libraries
- **📚 Academic Community** - For research opportunities

---

## 📞 Contact 🧑‍💻

- 📧 **Email**: [admin@amirhessam.com](mailto:admin@amirhessam.com)
- 💼 **LinkedIn**: [linkedin.com/in/amirhessam](https://linkedin.com/in/amirhessam)
- 🐙 **GitHub**: [github.com/amirhessam88](https://github.com/amirhessam88)
- 🌐 **Website**: [amirhessam.com](https://amirhessam.com)

---

<div align="center">

**⭐ Star this repository if you found it helpful! ⭐**

Made with ❤️ and lots of ☕ by Amir ...

</div>