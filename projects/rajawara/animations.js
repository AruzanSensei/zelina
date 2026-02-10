(() => {
    // Animation System for Raja Kecil 3D
    // Manual keyframe animation for procedural models

    const AnimationSystem = {
        // Animation state tracking
        activeAnimations: new Map(),

        // Animation parameters
        params: {
            walkSpeed: 4.0,      // Cycles per second
            runSpeed: 6.0,
            idleSpeed: 1.0,
            legSwing: 0.6,       // Max leg rotation (radians)
            legSwingRun: 0.9,
            bodyBob: 0.15,       // Vertical body movement
            bodyBobRun: 0.25,
            tailSwing: 0.4,
            headBob: 0.1
        },

        // Start an animation on a mesh
        play(mesh, animName, loop = true, speed = 1.0) {
            if (!mesh || !mesh.userData) return;

            mesh.userData.currentAnim = animName;
            mesh.userData.animTime = 0;
            mesh.userData.animLoop = loop;
            mesh.userData.animSpeed = speed;

            this.activeAnimations.set(mesh.uuid, mesh);
        },

        // Stop animation on a mesh
        stop(mesh) {
            if (!mesh) return;
            if (mesh.userData) {
                mesh.userData.currentAnim = null;
                mesh.userData.animTime = 0;
            }
            this.activeAnimations.delete(mesh.uuid);
        },

        // Update all active animations
        update(delta) {
            this.activeAnimations.forEach((mesh) => {
                if (!mesh.userData.currentAnim) {
                    this.activeAnimations.delete(mesh.uuid);
                    return;
                }

                mesh.userData.animTime += delta * mesh.userData.animSpeed;

                const animName = mesh.userData.currentAnim;
                const time = mesh.userData.animTime;

                // Call appropriate animation function
                switch (animName) {
                    case 'walk':
                        this.animateWalk(mesh, time);
                        break;
                    case 'run':
                        this.animateRun(mesh, time);
                        break;
                    case 'idle':
                        this.animateIdle(mesh, time);
                        break;
                    case 'eat':
                        this.animateEat(mesh, time);
                        break;
                    case 'drink':
                        this.animateDrink(mesh, time);
                        break;
                    case 'sleep':
                        this.animateSleep(mesh, time);
                        break;
                    case 'attack':
                        this.animateAttack(mesh, time);
                        break;
                }
            });
        },

        // Walking animation - alternating leg movement
        animateWalk(mesh, time) {
            const parts = mesh.userData.parts;
            if (!parts) return;

            const cycle = time * this.params.walkSpeed;
            const legSwing = this.params.legSwing;

            // Front legs alternate
            if (parts.legFL) {
                parts.legFL.rotation.x = Math.sin(cycle * Math.PI * 2) * legSwing;
            }
            if (parts.legFR) {
                parts.legFR.rotation.x = Math.sin(cycle * Math.PI * 2 + Math.PI) * legSwing;
            }

            // Back legs alternate (opposite of front)
            if (parts.legBL) {
                parts.legBL.rotation.x = Math.sin(cycle * Math.PI * 2 + Math.PI) * legSwing;
            }
            if (parts.legBR) {
                parts.legBR.rotation.x = Math.sin(cycle * Math.PI * 2) * legSwing;
            }

            // Body bob
            if (parts.body) {
                parts.body.position.y = Math.abs(Math.sin(cycle * Math.PI * 4)) * this.params.bodyBob;
            }

            // Tail sway
            if (parts.tail) {
                parts.tail.rotation.z = Math.sin(cycle * Math.PI * 2) * this.params.tailSwing;
            }
        },

        // Running animation - faster, more exaggerated
        animateRun(mesh, time) {
            const parts = mesh.userData.parts;
            if (!parts) return;

            const cycle = time * this.params.runSpeed;
            const legSwing = this.params.legSwingRun;

            // Front legs
            if (parts.legFL) {
                parts.legFL.rotation.x = Math.sin(cycle * Math.PI * 2) * legSwing;
            }
            if (parts.legFR) {
                parts.legFR.rotation.x = Math.sin(cycle * Math.PI * 2 + Math.PI) * legSwing;
            }

            // Back legs
            if (parts.legBL) {
                parts.legBL.rotation.x = Math.sin(cycle * Math.PI * 2 + Math.PI) * legSwing;
            }
            if (parts.legBR) {
                parts.legBR.rotation.x = Math.sin(cycle * Math.PI * 2) * legSwing;
            }

            // More pronounced body bob
            if (parts.body) {
                parts.body.position.y = Math.abs(Math.sin(cycle * Math.PI * 4)) * this.params.bodyBobRun;
            }

            // Faster tail sway
            if (parts.tail) {
                parts.tail.rotation.z = Math.sin(cycle * Math.PI * 2.5) * this.params.tailSwing * 1.3;
            }

            // Body lean forward
            if (parts.body) {
                parts.body.rotation.x = -0.1;
            }
        },

        // Idle animation - subtle breathing and movement
        animateIdle(mesh, time) {
            const parts = mesh.userData.parts;
            if (!parts) return;

            const cycle = time * this.params.idleSpeed;

            // Breathing (body expansion)
            if (parts.body) {
                const breathe = Math.sin(cycle * Math.PI * 2) * 0.02;
                parts.body.scale.set(1 + breathe, 1 + breathe, 1 + breathe);
                parts.body.position.y = 0;
                parts.body.rotation.x = 0;
            }

            // Subtle head bob
            if (parts.head) {
                parts.head.position.y = parts.head.userData.originalY + Math.sin(cycle * Math.PI * 2) * this.params.headBob;
            }

            // Tail gentle sway
            if (parts.tail) {
                parts.tail.rotation.z = Math.sin(cycle * Math.PI) * 0.15;
            }

            // Reset legs to neutral
            if (parts.legFL) parts.legFL.rotation.x = 0;
            if (parts.legFR) parts.legFR.rotation.x = 0;
            if (parts.legBL) parts.legBL.rotation.x = 0;
            if (parts.legBR) parts.legBR.rotation.x = 0;
        },

        // Eating animation - head down, chewing motion
        animateEat(mesh, time) {
            const parts = mesh.userData.parts;
            if (!parts) return;

            const cycle = time * 3.0; // Chewing speed

            // Head down
            if (parts.head) {
                parts.head.rotation.x = -0.5 + Math.sin(cycle * Math.PI * 2) * 0.1;
            }

            // Body slightly lowered
            if (parts.body) {
                parts.body.position.y = -0.2;
            }

            // Tail still
            if (parts.tail) {
                parts.tail.rotation.z = 0;
            }
        },

        // Drinking animation - head down to water
        animateDrink(mesh, time) {
            const parts = mesh.userData.parts;
            if (!parts) return;

            const cycle = time * 2.0;

            // Head down lower than eating
            if (parts.head) {
                parts.head.rotation.x = -0.8 + Math.sin(cycle * Math.PI * 2) * 0.05;
            }

            // Body lowered
            if (parts.body) {
                parts.body.position.y = -0.3;
            }

            // Front legs slightly bent
            if (parts.legFL) parts.legFL.rotation.x = 0.2;
            if (parts.legFR) parts.legFR.rotation.x = 0.2;
        },

        // Sleeping animation - lying down
        animateSleep(mesh, time) {
            const parts = mesh.userData.parts;
            if (!parts) return;

            const cycle = time * 0.5; // Slow breathing

            // Body rotated (lying down)
            if (parts.body) {
                parts.body.rotation.z = Math.PI / 2;
                parts.body.position.y = -0.5;
                // Breathing
                const breathe = Math.sin(cycle * Math.PI * 2) * 0.03;
                parts.body.scale.set(1 + breathe, 1 + breathe, 1 + breathe);
            }

            // Head resting
            if (parts.head) {
                parts.head.rotation.x = -0.3;
            }

            // Tail curled
            if (parts.tail) {
                parts.tail.rotation.z = 0.8;
            }
        },

        // Attack animation - lunge forward
        animateAttack(mesh, time) {
            const parts = mesh.userData.parts;
            if (!parts) return;

            // Attack is a short animation (0.5 seconds)
            const t = Math.min(time / 0.5, 1.0);

            if (t < 0.3) {
                // Wind up
                const windUp = t / 0.3;
                if (parts.body) {
                    parts.body.position.z = -windUp * 0.3;
                    parts.body.rotation.x = -windUp * 0.2;
                }
            } else if (t < 0.7) {
                // Lunge forward
                const lunge = (t - 0.3) / 0.4;
                if (parts.body) {
                    parts.body.position.z = -0.3 + lunge * 0.8;
                    parts.body.rotation.x = -0.2 + lunge * 0.3;
                }
                if (parts.head) {
                    parts.head.rotation.x = -lunge * 0.4;
                }
            } else {
                // Return to neutral
                const ret = (t - 0.7) / 0.3;
                if (parts.body) {
                    parts.body.position.z = 0.5 - ret * 0.5;
                    parts.body.rotation.x = 0.1 - ret * 0.1;
                }
                if (parts.head) {
                    parts.head.rotation.x = -0.4 + ret * 0.4;
                }
            }

            // Stop after one cycle
            if (t >= 1.0 && !mesh.userData.animLoop) {
                this.stop(mesh);
            }
        },

        // Reset mesh to neutral pose
        resetPose(mesh) {
            const parts = mesh.userData.parts;
            if (!parts) return;

            // Reset all transformations
            if (parts.body) {
                parts.body.position.set(0, 0, 0);
                parts.body.rotation.set(0, 0, 0);
                parts.body.scale.set(1, 1, 1);
            }

            if (parts.head && parts.head.userData.originalY !== undefined) {
                parts.head.position.y = parts.head.userData.originalY;
                parts.head.rotation.set(0, 0, 0);
            }

            if (parts.tail) {
                parts.tail.rotation.set(0, 0, 0);
            }

            ['legFL', 'legFR', 'legBL', 'legBR'].forEach(leg => {
                if (parts[leg]) {
                    parts[leg].rotation.set(0, 0, 0);
                }
            });
        }
    };

    Game.animations = AnimationSystem;
})();
