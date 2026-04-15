<script setup lang="ts">
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { Levioso } from '@tresjs/cientos'
import { Vector2 } from 'three'
import type { Mesh, MeshStandardMaterial, Object3D } from 'three'
import type { GithubReleasesResponse } from '~/shared/types/github'
import { gsap } from 'gsap'
import { SplitText } from 'gsap/SplitText'

definePageMeta({ layout: false })

const { public: { discordUrl } } = useRuntimeConfig()
const { data: releasesData } = await useFetch<GithubReleasesResponse>('/api/github/releases')
const totalDownloads = computed(() => releasesData.value?.totalDownloads ?? 0)
const latestDownloadUrl = computed(() => releasesData.value?.latestDownloadUrl ?? undefined)
const roseModelUrl = `${import.meta.env.BASE_URL}rose.glb`

const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/')

const { state: model } = useLoader(
    GLTFLoader,
    roseModelUrl,
    (loader) => {
      (loader as GLTFLoader).setDRACOLoader(dracoLoader)
    }
)

const canvasWrapperRef = ref<HTMLElement | null>(null)
const badgeRef         = ref<HTMLElement | null>(null)
const h1Ref            = ref<HTMLElement | null>(null)
const pRef             = ref<HTMLElement | null>(null)
const buttonsRowRef    = ref<HTMLElement | null>(null)

const ROSE_SCALE = 8.8
const roseFinalY = -8.6
const roseLookAtY = -2.2
const ROSE_Z = 1.9

const CAM_R = 7.6
const CAM_THETA_FINAL = 0.5
const CAM_THETA_START = 1.02
const CAM_Y_OFFSET_FINAL = -0.55
const CAM_Y_OFFSET_START = -1.35

const camOrbit = reactive({
  theta: CAM_THETA_START,
  yOffset: CAM_Y_OFFSET_START,
})
const cameraPos = computed<[number, number, number]>(() => [
  0,
  CAM_R * Math.sin(camOrbit.theta) + camOrbit.yOffset,
  CAM_R * Math.cos(camOrbit.theta),
])

const chromaticOffset = reactive({ x: 0, y: 0 })
const chromaticVector = computed(() => new Vector2(chromaticOffset.x, chromaticOffset.y))

const dof = reactive({ bokehScale: 0 })

const dissolveUniform = { value: 0 }

const rosePose = reactive({ y: -10 })

watch([cameraPos, () => rosePose.y], ([cam, roseY]) => {
  console.log(`Camera: ${cam[0].toFixed(2)}, ${cam[1].toFixed(2)}, ${cam[2].toFixed(2)} | Rose Y: ${roseY.toFixed(2)} | LookAt: [0, ${roseLookAtY}, 0]`)
})

function triggerGlitch() {
  const caX      = 0.0012 + Math.random() * 0.003
  const caY      = 0.0006 + Math.random() * 0.0018
  const spike    = 0.02   + Math.random() * 0.025
  const decay    = 0.1    + Math.random() * 0.12

  gsap.to(chromaticOffset, {
    x: caX, y: caY, duration: spike, ease: 'none',
    onComplete() {
      gsap.to(chromaticOffset, {
        x: 0, y: 0, duration: decay, ease: 'power2.out',
        onComplete: scheduleGlitch
      })
    }
  })
}

function scheduleGlitch() {
  setTimeout(triggerGlitch, 11000 + Math.random() * 9000)
}

function applyDissolveToScene(scene: Object3D) {
  scene.traverse((child) => {
    const mesh = child as Mesh
    if (!mesh.isMesh) return
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
    mats.forEach((mat, i) => {
      const m = (mat as MeshStandardMaterial).clone()
      m.transparent = true
      m.customProgramCacheKey = () => 'dissolve'
      m.onBeforeCompile = (shader) => {
        shader.uniforms.uDissolve = dissolveUniform
        shader.fragmentShader = shader.fragmentShader.replace(
            'void main() {',
            `uniform float uDissolve;
            void main() {`
        )
        shader.fragmentShader = shader.fragmentShader.replace(
            /}\s*$/,
            `  float _dHash = fract(sin(dot(floor(gl_FragCoord.xy / 6.0), vec2(127.1, 311.7))) * 43758.5453);
            if (_dHash > uDissolve) discard;
}`
        )
      }
      if (Array.isArray(mesh.material)) {
        (mesh.material as MeshStandardMaterial[])[i] = m
      } else {
        mesh.material = m
      }
    })
  })
}

function animateText() {
  const tl = gsap.timeline()

  tl.to(dof, { bokehScale: 6, duration: 0.4, ease: 'power1.out' })

  const h1Split = new SplitText(h1Ref.value, { type: 'chars' })
  tl.set(h1Ref.value, { autoAlpha: 1 })
  tl.from(h1Split.chars, {
    autoAlpha: 0, y: 20, duration: 0.3, ease: 'power2.out', stagger: 0.03,
    onComplete() { h1Split.revert() }
  }, '<')

  tl.to(badgeRef.value, { autoAlpha: 1, duration: 0.3, ease: 'power2.out' }, '<+0.2')

  const pSplit = new SplitText(pRef.value, { type: 'lines' })
  tl.set(pRef.value, { autoAlpha: 1 })
  tl.from(pSplit.lines, {
    autoAlpha: 0, y: 16, duration: 0.3, ease: 'power2.out', stagger: 0.15,
    onComplete() { pSplit.revert() }
  }, '>-0.25')

  const btns = buttonsRowRef.value ? Array.from(buttonsRowRef.value.children) : []
  tl.to(btns, { autoAlpha: 1, duration: 0.35, ease: 'power2.out', stagger: 0.1 }, '>-0.2')
}

function animateRose() {
  if (model.value?.scene) {
    applyDissolveToScene(model.value.scene)
  }

  gsap.set(canvasWrapperRef.value, { autoAlpha: 0 })
  gsap.to(canvasWrapperRef.value, { autoAlpha: 1, duration: 0.3, ease: 'none' })

  // Camera arcs from above-behind on the YZ sphere to final resting position
  gsap.to(camOrbit, {
    theta: CAM_THETA_FINAL,
    yOffset: CAM_Y_OFFSET_FINAL,
    duration: 2.2,
    ease: 'power2.out',
  })

  gsap.timeline({
    onComplete() {
      scheduleGlitch()
      animateText()
    }
  })
      .to(dissolveUniform, { value: 1, duration: 1.4, ease: 'power2.inOut' })
      .to(rosePose, { y: roseFinalY, duration: 0.8, ease: 'power2.out' }, '<')
}

onMounted(() => {
  if (!import.meta.client) return

  gsap.registerPlugin(SplitText)

  gsap.set([badgeRef.value, h1Ref.value, pRef.value], { autoAlpha: 0 })
  gsap.set(buttonsRowRef.value?.children ?? [], { autoAlpha: 0 })

  if (model.value) {
    animateRose()
  } else {
    watch(model, () => animateRose(), { once: true })
  }
})
</script>

<template>
  <main class="font-main">
    <header class="relative w-screen h-screen overflow-hidden">
      <div class="absolute left-1/2 -translate-x-1/2 flex flex-col gap-6 items-center mt-44 text-center z-50">
        <div class="flex flex-col items-center gap-1">
          <div ref="badgeRef" class="invisible">
            <UBadge color="success" variant="soft">
              Trusted across {{ totalDownloads.toLocaleString() }} downloads
            </UBadge>
          </div>
          <h1 ref="h1Ref" class="invisible font-bold text-7xl text-white">League unlocked</h1>
        </div>
        <p ref="pRef" class="invisible text-2xl text-slate-200">Rose is an open-source automatic skin changer for League of Legends that enables seamless access to all skins in the game and more.</p>
        <div class="flex flex-col gap-1">
          <div ref="buttonsRowRef" class="flex items-center gap-2 w-full">
            <UButton
                :to="latestDownloadUrl"
                color="primary"
                target="_blank"
                icon="i-lucide-download"
                size="xl"
                label="Download latest version"
                class="invisible"
            />
            <UButton
                to="/docs/introduction"
                color="secondary"
                icon="i-lucide-book-open"
                size="xl"
                label="Documentation"
                class="invisible"
            />
            <UButton
                :to="discordUrl"
                color="secondary"
                icon="i-simple-icons-discord"
                size="xl"
                class="invisible"
            />
          </div>
        </div>
      </div>

      <div ref="canvasWrapperRef" class="absolute inset-0">
        <ClientOnly>
          <TresCanvas clear-color="#0a0a0a" class="absolute inset-0 w-full h-full pointer-events-none">
            <TresPerspectiveCamera :position="cameraPos" :look-at="[0, roseLookAtY, 0]" />
            <TresAmbientLight :intensity="0.8" />
            <TresDirectionalLight :position="[5, 12, 5]" :intensity="0.8" />
            <TresDirectionalLight :position="[-3, 4, -3]" :intensity="0.9" color="#ffaacc" />
            <Levioso :speed="0.45" :floatFactor="0.7">
              <primitive v-if="model" :object="model.scene" :scale="[ROSE_SCALE, ROSE_SCALE, ROSE_SCALE]" :position="[0, rosePose.y, ROSE_Z]" />
            </Levioso>
            <Suspense>
              <EffectComposerPmndrs>
                <BloomPmndrs :intensity="1.2" :luminance-threshold="0.3" :luminance-smoothing="0.6" />
                <ChromaticAberrationPmndrs :offset="chromaticVector" :radial-modulation="true" :modulation-offset="0.2" />
                <DepthOfFieldPmndrs :focus-distance="10" :focus-range="6" :bokeh-scale="dof.bokehScale" />
              </EffectComposerPmndrs>
            </Suspense>
          </TresCanvas>
        </ClientOnly>
      </div>
    </header>

    <UContainer class="flex flex-col gap-20 my-20">
      <section class="flex flex-col gap-10">
        <h2 class="text-3xl text-slate-950 font-bold">A complete modding software for League of Legends</h2>
        <div class="grid grid-cols-4 gap-6">
          <div class="col-span-2 flex flex-col size-full p-6 bg-slate-50 rounded-lg cursor-pointer hover:scale-102 transition-transform duration-400">
            <UIcon name="i-streamline-pixel-design-color-palette-sample" class="size-20 text-primary"/>
            <div class="flex flex-col gap-1 w-full mt-5">
              <h3 class="title text-2xl! max-w-2/3 w-full">
                Skins changer
              </h3>
              <p>Rose enable smooth access to all skins in the game</p>
            </div>
          </div>
          <div class="col-span-2 flex flex-col size-full p-6 bg-slate-50 rounded-lg cursor-pointer hover:scale-102 transition-transform duration-400">
            <UIcon name="i-streamline-pixel-multiple-user" class="size-20 text-primary"/>
            <div class="flex flex-col gap-1 w-full mt-5">
              <h3 class="title text-2xl! max-w-2/3 w-full">
                Party mode
              </h3>
              <p>Let your friends see your skins from Rose and see theirs through a shared party code</p>
            </div>
          </div>
          <div class="col-span-1 flex flex-col size-full p-6 bg-slate-50 rounded-lg cursor-pointer hover:scale-102 transition-transform duration-400">
            <UIcon name="i-streamline-pixel-design-color-painting-palette" class="size-20 text-primary"/>
            <div class="flex flex-col gap-1 w-full mt-5">
              <h3 class="title text-2xl! max-w-2/3 w-full">
                Custom skins
              </h3>
              <p>Use your favorite custom skins from anywhere</p>
            </div>
          </div>
          <div class="col-span-1 flex flex-col size-full p-6 bg-slate-50 rounded-lg cursor-pointer hover:scale-102 transition-transform duration-400">
            <UIcon name="i-streamline-pixel-entertainment-events-hobbies-board-game-dice" class="size-20 text-primary"/>
            <div class="flex flex-col gap-1 w-full mt-5">
              <h3 class="title text-2xl! max-w-2/3 w-full">
                Random skins
              </h3>
              <p>Get randomized skin & chroma for you selection</p>
            </div>
          </div>
          <div class="col-span-2 flex flex-col size-full p-6 bg-slate-50 rounded-lg cursor-pointer hover:scale-102 transition-transform duration-400">
            <UIcon name="i-streamline-pixel-interface-essential-hierarchy-5" class="size-20 text-primary"/>
            <div class="flex flex-col gap-1 w-full mt-5">
              <h3 class="title text-2xl! max-w-2/3 w-full">
                Forms wheel
              </h3>
              <p>Custom form selection interface for skins with multiple forms, such as Elementalist Lux</p>
            </div>
          </div>
        </div>
        <div class="flex flex-col gap-3">
          <h2 class="font-bold text-3xl text-slate-800">Rose also does</h2>
          <div class="flex flex-wrap items-center gap-2">
            <UMarquee

            >
              <UBadge color="neutral" size="lg" variant="soft">
                <span class="font-semibold">Smart injection:</span> never injects skins you already own
              </UBadge>
              <UBadge color="neutral" size="lg" variant="soft">
                <span class="font-semibold">Auto updates:</span> for Rose and skins
              </UBadge>
              <UBadge color="neutral" size="lg" variant="soft">
                <span class="font-semibold">Multi-Language Support:</span> works with any client language
              </UBadge>
              <UBadge color="neutral" size="lg" variant="soft">
                <span class="font-semibold">Open Source:</span> fully open source and extensible
              </UBadge>
              <UBadge color="neutral" size="lg" variant="soft">
                <span class="font-semibold">Free :</span> if you bought this software, you got scammed...
              </UBadge>
            </UMarquee>
          </div>
          <p class="text-lg">And much more under the hood to ensure a smooth and extensible experience.</p>
        </div>
      </section>
      <section class="flex flex-col items-center gap-10 p-20 text-center bg-primary-600 rounded-lg">
        <h2 class="font-bold text-5xl text-slate-50">Get rose for free</h2>
        <UButton :to="latestDownloadUrl" color="neutral" size="xl" target="_blank">Download latest version</UButton>
      </section>
    </UContainer>
  </main>
</template>
