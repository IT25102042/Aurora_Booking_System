 document.addEventListener("DOMContentLoaded", function () {
            checkSession();
            loadStylistCarousel();
        });

async function checkSession() {
            try {
                const response = await fetch('http://localhost:8080/api/users/check-session', { credentials: 'include' });
                const data = await response.json();

                if (data.status && data.user) {
                    document.getElementById("welcomeUserText").innerHTML = `Welcome ${data.user.firstName}`;
                    document.getElementById("navSignIn").style.display = "none";
                    document.getElementById("navSignUp").style.display = "none";
                    document.getElementById("navSignOut").style.display = "block";
                }
            } catch (error) {
                console.error("Error checking session:", error);
            }
        }

        async function signOut() {
            try {
                const response = await fetch('http://localhost:8080/api/users/signout', { method: 'POST', credentials: 'include' });
                const data = await response.json();

                if (data.status) {
                    window.location.href = "home.html";
                }
            } catch (error) {
                console.error("Error signing out:", error);
            }
        }


// Function to load stylists for the carousel on home page
async function loadStylistCarousel() {
    const track = document.getElementById('stylistCarouselTrack');
    if (!track) return; // Only execute if on home page with the track

    try {
        const response = await fetch('/api/stylist-profiles');
        if (!response.ok) throw new Error('Failed to fetch stylists');
        const stylists = await response.json();

        if (stylists.length === 0) {
            track.innerHTML = '<p class="text-center" style="color: var(--text-secondary); width: 100%;">No stylists available at the moment.</p>';
            return;
        }

        // Duplicate the list enough times for continuous infinite scroll
        // CSS animation moves by 50% so we need at least 2 identical halves.
        // We'll duplicate the array elements so we have plenty to scroll through continuously.
        const minItemsForScroll = 12;
        let displayStylists = [...stylists];
        while(displayStylists.length < minItemsForScroll) {
            displayStylists = [...displayStylists, ...stylists];
        }
        // Duplicate once more to satisfy the 50% translate logic flawlessly
        displayStylists = [...displayStylists, ...displayStylists];

        let html = '';
        displayStylists.forEach((stylist) => {
            const imageUrl = `user_images/${stylist.userId}/image1.png`;
            const name = stylist.firstName + (stylist.lastName ? ` ${stylist.lastName}` : '');

            html += `
                <div class="stylist-card-wrapper">
                    <div class="gallery-card">
                        <div class="card-img-wrapper">
                            <img src="${imageUrl}" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random'" alt="${name}">
                            <div class="card-overlay" style="padding: 10px; text-align: center; background: linear-gradient(to top, rgba(0, 0, 0, 0.9), transparent);">
                                <h3 class="card-title-g" style="margin: 0; font-size: 0.95rem; font-weight: 600;">${name}</h3>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });

        track.innerHTML = html;

        // Adjust animation duration based on total items in one half
        const totalItemsInHalf = displayStylists.length / 2;
        track.style.animationDuration = `${totalItemsInHalf * 4}s`;

    } catch (error) {
        console.error('Error loading stylists:', error);
    }
}