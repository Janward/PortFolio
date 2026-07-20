document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------
    // 1. MOBILE NAVBAR TOGGLE
    // ----------------------------------------------------
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
        });

        // Close menu when clicking link
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            });
        });
    }

    // Active link highlighting on scroll
    const sections = document.querySelectorAll('section');
    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= (sectionTop - sectionHeight / 3)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });


    // ----------------------------------------------------
    // 2. CANVAS NODE NETWORK ANIMATION
    // ----------------------------------------------------
    const canvas = document.getElementById('network-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        let mouse = { x: null, y: null, radius: 120 };

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initParticles();
        };

        class Particle {
            constructor(x, y) {
                this.x = x;
                this.y = y;
                this.vx = (Math.random() - 0.5) * 0.5;
                this.vy = (Math.random() - 0.5) * 0.5;
                this.radius = Math.random() * 2 + 1;
                this.color = 'rgba(0, 242, 254, 0.4)';
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.fill();
            }

            update() {
                // Bounds collision
                if (this.x < 0 || this.x > canvas.width) this.vx = -this.vx;
                if (this.y < 0 || this.y > canvas.height) this.vy = -this.vy;

                // Mouse interaction (repelling effect)
                if (mouse.x && mouse.y) {
                    let dx = mouse.x - this.x;
                    let dy = mouse.y - this.y;
                    let distance = Math.hypot(dx, dy);
                    if (distance < mouse.radius) {
                        const force = (mouse.radius - distance) / mouse.radius;
                        const angle = Math.atan2(dy, dx);
                        this.x -= Math.cos(angle) * force * 2;
                        this.y -= Math.sin(angle) * force * 2;
                    }
                }

                this.x += this.vx;
                this.y += this.vy;
                this.draw();
            }
        }

        const initParticles = () => {
            particles = [];
            const count = Math.min(Math.floor((canvas.width * canvas.height) / 12000), 100);
            for (let i = 0; i < count; i++) {
                particles.push(new Particle(Math.random() * canvas.width, Math.random() * canvas.height));
            }
        };

        const connect = () => {
            const maxDistance = 140;
            for (let a = 0; a < particles.length; a++) {
                for (let b = a + 1; b < particles.length; b++) {
                    let dx = particles[a].x - particles[b].x;
                    let dy = particles[a].y - particles[b].y;
                    let distance = Math.hypot(dx, dy);

                    if (distance < maxDistance) {
                        const alpha = (1 - (distance / maxDistance)) * 0.15;
                        ctx.strokeStyle = `rgba(0, 242, 254, ${alpha})`;
                        ctx.lineWidth = 0.8;
                        ctx.beginPath();
                        ctx.moveTo(particles[a].x, particles[a].y);
                        ctx.lineTo(particles[b].x, particles[b].y);
                        ctx.stroke();
                    }
                }
            }
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => p.update());
            connect();
            requestAnimationFrame(animate);
        };

        // Event Listeners
        window.addEventListener('resize', resizeCanvas);
        window.addEventListener('mousemove', (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        });
        window.addEventListener('mouseout', () => {
            mouse.x = null;
            mouse.y = null;
        });

        resizeCanvas();
        animate();
    }


    // ----------------------------------------------------
    // 3. MOCK SERVER STATS & LIVE GRAPH
    // ----------------------------------------------------
    const latencyEl = document.getElementById('live-latency');
    const pathLine = document.getElementById('latency-line');
    const pathArea = document.getElementById('latency-area');

    if (latencyEl && pathLine && pathArea) {
        // Initial data points for the latency graph (20 points, range 0-100 where 100 is bottom, 0 is top)
        let dataPoints = Array(21).fill(70);
        const pointsCount = 20;
        const width = 400;
        const height = 100;
        const xStep = width / pointsCount;

        const updateGraph = () => {
            // Shift points and add new random latency point (representing 8ms - 35ms)
            const latencyValue = Math.floor(Math.random() * 12) + 9; // 9ms to 20ms
            latencyEl.textContent = `${latencyValue} ms`;

            // Scale latency to graph height (lower time = higher point / smaller y)
            // Range 8-35 ms maps to y-coordinate 80-20
            const y = height - ((latencyValue - 5) * 3);
            const clampedY = Math.max(10, Math.min(y, 90));

            dataPoints.shift();
            dataPoints.push(clampedY);

            // Generate Path String
            let lineD = `M 0 ${dataPoints[0]}`;
            for (let i = 1; i <= pointsCount; i++) {
                const x = i * xStep;
                const currentY = dataPoints[i];
                // Smooth line using quadratic bezier or line
                lineD += ` L ${x} ${currentY}`;
            }

            pathLine.setAttribute('d', lineD);

            // Generate Area Path String (closes the shape at the bottom)
            const areaD = lineD + ` L ${width} ${height} L 0 ${height} Z`;
            pathArea.setAttribute('d', areaD);
        };

        // Update stats periodically
        setInterval(updateGraph, 1000);
    }


    // ----------------------------------------------------
    // 4. INTERACTIVE CLI TERMINAL
    // ----------------------------------------------------
    const terminalInput = document.getElementById('terminal-input');
    const terminalOutput = document.getElementById('terminal-output');
    const terminalScreen = document.getElementById('terminal-screen');

    if (terminalInput && terminalOutput && terminalScreen) {
        // Focus when clicking anywhere on the screen
        terminalScreen.addEventListener('click', () => {
            terminalInput.focus();
        });

        let commandHistory = [];
        let historyIndex = -1;

        const cliData = {
            profile: `[Janward Alfredo]\n` +
                     `Lokasi: Cengkareng, Jakarta Barat\n` +
                     `Kontak: 0895611554304 | ajanward@gmail.com\n\n` +
                     `Seorang IT Infrastructure & Network Specialist berpengalaman 5+ tahun dalam mengelola server,\n` +
                     `virtualisasi (Proxmox), keamanan sistem (123+ CCTV), dan otomatisasi backup untuk mendukung\n` +
                     `stabilitas operasional &plusmn;200 pengguna. Lulusan S1 Teknik Informatika (Mikroskill, GPA 3.21).`,
            
            skills: `--- KEAHLIAN UTAMA ---\n` +
                    `1. Network Management  : Mikrotik, managed switch, LAN/WAN, routing, VLAN\n` +
                    `2. Virtualization      : Hypervisor Proxmox VE, Virtual Machines, Cluster monitoring\n` +
                    `3. Server OS           : Windows Server 2019, OpenMediaVault (OMV) NAS\n` +
                    `4. Cloud Services      : Nextcloud, Immich media server\n` +
                    `5. System Security     : Desain DVR/NVR, instalasi & setup 123+ CCTV titik kamera\n` +
                    `6. Automation & Backup : Penjadwalan database backup otomatis via scripting (PowerShell/Bash)\n` +
                    `7. Troubleshooting     : Diagnosa hardware server, disaster recovery (UPS, PSU, HDD recovery)`,
            
            experience: `--- RIWAYAT PENGALAMAN ---\n` +
                        `1. SPV IT Network & Hardware - PT Nico Urban Indonesia (Januari 2023 - Sekarang)\n` +
                        `   * Mengelola 7 server fisik & 5 virtual machine (Proxmox) untuk 200+ user.\n` +
                        `   * Administrasi Windows Server 2019, OMV, Nextcloud & Immich.\n` +
                        `   * Konfigurasi infrastruktur jaringan (Mikrotik & Managed Switches).\n` +
                        `   * Memimpin instalasi, upgrade, dan integrasi 123+ titik CCTV DVR/NVR.\n` +
                        `   * Mengembangkan skema backup server & database terjadwal otomatis.\n` +
                        `   * Mengoordinasikan recovery hardware server akibat gangguan lonjakan daya listrik.\n` +
                        `2. Guru TIK - Yayasan Sultan Iskandar Muda Medan (Oktober 2018 - Maret 2022)\n` +
                        `   * Mengajar bidang TIK untuk siswa SMK dengan pendekatan praktis.\n` +
                        `   * Mengelola operasional dan memelihara 40+ unit PC di laboratorium komputer.\n` +
                        `   * Menyediakan bantuan IT internal dan mengonfigurasi jaringan LAN/Wi-Fi yayasan.`,
            
            projects: `--- DETAIL PROYEK UTAMA ---\n` +
                      `1. Automation Backup Server (Python/Shell Scripting)\n` +
                      `   - Memprogram backup otomatis terjadwal untuk database SQL & server files ke OMV NAS.\n` +
                      `2. Implementasi & Upgrade CCTV (DVR/NVR/IP Cameras)\n` +
                      `   - Memimpin instalasi 123 titik CCTV di area pabrik dengan segmentasi VLAN jaringan terpisah.\n` +
                      `3. Modernisasi Infrastruktur Server (Proxmox Virtualization)\n` +
                      `   - Migrasi server fisik lama ke hypervisor Proxmox dengan 5+ VM aktif, optimasi alokasi hardware.\n` +
                      `4. Manajemen Kabel Jaringan (LAN Cables & Rack Server)\n` +
                      `   - Mengatur ulang kabel server berantakan menggunakan patch panel baru untuk mempercepat troubleshooting.`,
            
            contact: `--- DETAIL KONTAK ---\n` +
                     `Email      : ajanward@gmail.com\n` +
                     `Handphone  : 0895-6115-54304\n` +
                     `Alamat     : Cengkareng, Jakarta Barat, DKI Jakarta\n` +
                     `LinkedIn   : linkedin.com/in/janward-alfredo (Dummy)\n` +
                     `GitHub     : github.com/janward-alfredo (Dummy)`
        };

        const printLine = (text, className = '') => {
            const line = document.createElement('div');
            line.className = `terminal-line ${className}`;
            line.innerHTML = text;
            terminalOutput.appendChild(line);
            terminalScreen.scrollTop = terminalScreen.scrollHeight;
        };

        const processCommand = (rawInput) => {
            const input = rawInput.trim();
            if (input === '') return;

            // Add to history
            commandHistory.push(input);
            historyIndex = commandHistory.length;

            // Echo input
            printLine(`guest@janward-cli:~$ ${input}`, 'text-muted');

            const parts = input.split(' ');
            const cmd = parts[0].toLowerCase();
            const arg = parts.slice(1).join(' ');

            switch (cmd) {
                case 'help':
                    printLine(`Perintah yang tersedia:\n` +
                              `  <span class="text-cyan">about</span>       - Ringkasan profil profesional Janward Alfredo\n` +
                              `  <span class="text-cyan">skills</span>      - Daftar keahlian teknis (network, virtualization, dll)\n` +
                              `  <span class="text-cyan">experience</span>  - Riwayat pengalaman kerja profesional\n` +
                              `  <span class="text-cyan">projects</span>    - Detail proyek yang pernah dikerjakan\n` +
                              `  <span class="text-cyan">contact</span>     - Detail kontak langsung\n` +
                              `  <span class="text-cyan">ping</span>        - Jalankan utilitas ping jaringan ke server portofolio\n` +
                              `  <span class="text-cyan">clear</span>       - Hapus seluruh output layar terminal\n` +
                              `  <span class="text-cyan">exit</span>        - Keluar dari sesi console`, 'text-light');
                    break;
                case 'about':
                case 'profile':
                    printLine(cliData.profile);
                    break;
                case 'skills':
                    printLine(cliData.skills);
                    break;
                case 'experience':
                    printLine(cliData.experience);
                    break;
                case 'projects':
                    printLine(cliData.projects);
                    break;
                case 'contact':
                    printLine(cliData.contact);
                    break;
                case 'clear':
                    terminalOutput.innerHTML = '';
                    break;
                case 'exit':
                    printLine('Sesi konsol berakhir. Ketik ulang perintah untuk masuk kembali.', 'text-red');
                    terminalInput.disabled = true;
                    break;
                case 'ping':
                    const host = arg || 'janward-alfredo.id';
                    printLine(`PING ${host} (192.168.1.100) 56(84) bytes of data.`, 'text-cyan');
                    
                    let seq = 1;
                    const interval = setInterval(() => {
                        const time = (Math.random() * 5 + 8).toFixed(2);
                        printLine(`64 bytes from 192.168.1.100 (${host}): icmp_seq=${seq} ttl=64 time=${time} ms`);
                        seq++;
                        if (seq > 4) {
                            clearInterval(interval);
                            printLine(`--- ${host} ping statistics ---`);
                            printLine(`4 packets transmitted, 4 received, 0% packet loss, time 3004ms`);
                            printLine(`rtt min/avg/max/mdev = 8.12/10.45/13.84/1.24 ms`, 'text-cyan');
                            terminalInput.disabled = false;
                            terminalInput.focus();
                        }
                    }, 500);
                    
                    // Temporarily disable input during ping loop
                    terminalInput.disabled = true;
                    break;
                default:
                    printLine(`Command not found: <span class="text-red">${cmd}</span>. Ketik <span class="text-cyan">help</span> untuk daftar perintah.`, 'text-light');
            }
        };

        // Event listener for enter key
        terminalInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const val = terminalInput.value;
                terminalInput.value = '';
                processCommand(val);
            } else if (e.key === 'ArrowUp') {
                if (historyIndex > 0) {
                    historyIndex--;
                    terminalInput.value = commandHistory[historyIndex];
                }
                e.preventDefault();
            } else if (e.key === 'ArrowDown') {
                if (historyIndex < commandHistory.length - 1) {
                    historyIndex++;
                    terminalInput.value = commandHistory[historyIndex];
                } else {
                    historyIndex = commandHistory.length;
                    terminalInput.value = '';
                }
                e.preventDefault();
            }
        });
    }


    // ----------------------------------------------------
    // 5. PROJECTS SECTION FILTERS
    // ----------------------------------------------------
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    if (filterButtons && projectCards) {
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                // Toggle active class on buttons
                filterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const filterValue = btn.getAttribute('data-filter');

                // Filter cards
                projectCards.forEach(card => {
                    if (filterValue === 'all' || card.getAttribute('data-category') === filterValue) {
                        card.style.display = 'flex';
                        // Trigger CSS anim re-entry
                        card.style.opacity = '0';
                        setTimeout(() => {
                            card.style.opacity = '1';
                            card.style.transition = 'opacity 0.4s ease-out';
                        }, 50);
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });
    }


    // ----------------------------------------------------
    // 6. SCROLL REVEAL ANIMATIONS
    // ----------------------------------------------------
    const revealElements = document.querySelectorAll('.scroll-reveal, .animate-left, .animate-right');

    const revealOnScroll = () => {
        const triggerBottom = window.innerHeight * 0.85;

        revealElements.forEach(el => {
            const boxTop = el.getBoundingClientRect().top;
            if (boxTop < triggerBottom) {
                el.classList.add('active');
            }
        });
    };

    window.addEventListener('scroll', revealOnScroll);
    // Trigger on load once
    revealOnScroll();


    // ----------------------------------------------------
    // 7. CONTACT FORM SUBMISSION
    // ----------------------------------------------------
    const contactForm = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');

    if (contactForm && formStatus) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Collect Form data
            const name = document.getElementById('form-name').value;
            const email = document.getElementById('form-email').value;
            const subject = document.getElementById('form-subject').value;
            const message = document.getElementById('form-message').value;

            formStatus.className = 'form-status';
            formStatus.innerHTML = '[System] Mengirimkan pesan... mohon tunggu.';

            // Simulate Network Request to server
            setTimeout(() => {
                formStatus.className = 'form-status success';
                formStatus.innerHTML = '[Success] Pesan Anda telah berhasil terkirim ke Inbox Janward Alfredo. Terima kasih!';
                contactForm.reset();
            }, 1800);
        });
    }
});
