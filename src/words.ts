// Passphrase words: common, concrete, easy to type and spell, written for this app (no external list).
// Each word adds log2(WORDS.length) bits; the entropy maths reads the length, so adding words is safe.
export const WORDS: readonly string[] = `
able acid acorn acre acrobat actor adapt admit adobe adopt adult agent agile aging agree ahead aim aisle
alarm album alert algae alias alien align alive alley allow alloy almanac almond alpha alpine alto amber
amend amino ample amuse anchor angle angry ankle answer anthem antler anvil apple apricot apron arcade arch
arena argue armada armor army aroma arrow artist artwork ascend ash aspen asset asteroid atlas atom attic
audio audit aunt aura autumn avid avocado avoid awake award axis bacon badge bagel baker ballad balmy bamboo
banana band banjo bank banner barley barn baron barrel basil basin basket batch bath baton beach beacon beam
bean bear beaver bed beech beef beetle begin bell belt bench beret berry bike bingo birch bird bison bistro
blade blank blanket blast blaze blend bless blimp blink bliss block bloom blossom blue blunt blush board boat
body bolt bonfire bonus book boost booth border boss botany bottle bounce bouquet bow bowl boxer bracket
brain brake branch brass brave bread breakfast breeze brick bridge brief bright brim brisk broad bronze brook
broom brush bubble bucket buckle buddy budget buffalo bugle build bulb bundle bunny burrow bush butter button
buzz cabbage cabin cable cactus cadet cafe cage cake calm camel camera camp canal candle candy cane canoe
canopy canvas canyon cape caramel carbon card cargo carpet carrot cart carve cascade case castle cat catalog
caviar cedar cell cello census cereal chain chair chalk chamber champ chant chapel chariot charm chart chase
cheek cheer cheese cheetah chef cherry chess chest chew chief child chili chimera chimney chip chirp chord
chorus cider cinema circle circus citrus city civic claim clam clap clay clean clerk clever click cliff climb
clinic clip cloak clock cloud clover clown club clue coach coast cobalt cobra cocoa coconut code coffee coil
coin cold comet comfy comic compass condor cookie copper coral cord cork corn corner cornet cosmic cottage
cotton couch cougar count cove cover coyote cozy crab craft crane crate crater crayon cream credit creek
crest cricket crisp critic crow crown crumb crust crystal cube cuddle cup cupcake curb curl curry curve
cushion cycle cymbal dahlia daily dairy daisy dance dandy dash data dawn dazzle deal debut decade
decent decoy deep deer delta demo denim depth desert design desk dessert detail dial diamond diary diet digit
dime diner dingo dinner dipper dish ditto diver dizzy dock doctor dolphin dome domino donkey donut door dose
dove draft dragon dragonfly drama drawer dream dress drift drill drink drive drizzle drop drum duck dune dusk
dust duty dwarf dynamo eager eagle early earth easel east echo eclipse edge edit eel effort egg eggplant
eight elbow elder elect elegant elephant elevator elk elm ember emblem emerald emperor empty enamel energy
engine engraving enjoy entry envoy epic equal era errand escape essay ethic event exact exile exit expert
extra fable fabric face factor fade fair fairy faith falafel falcon fame fancy fang farm fast feast feather
fence fern ferry fetch fever fiber fiddle field fiesta fig film final finch fire firefly firm fish five flag
flame flamingo flash flask fleet flint flip float flock flood floor flora flour flower fluent flute focus
foggy folk forest forge fork form fort forum fossil found fountain fox frame fresh frog frost fruit fudge
fuel fun fungus funny fury fuzzy gadget galaxy gale gallon game garage garden garlic gate gauge gazelle gear
gecko gem genius genre gentle gift giggle ginger giraffe glacier glad glass glide globe glory glove glow glue
goat goblet gold golf gondola gong good goose gorilla gospel gown grace grade grain grand granite grant grape
graph grass gravel gravy great green grid griffin grill grin grip grove growl guard guava guess guest guide
guitar gull gummy guru gust habit hail hair half hall halo hammer hamster hand happy harbor hardy harp
harvest hash hatch haven hawk hazel hazelnut head heap heart heat hedge hedgehog heel helix hello helmet herb
herd hero heron hibiscus hiker hill hinge hippo hobby hockey hold holly home honey hood hook hope horizon
horn horse host hotel hound hour house hover hug human humble hummus humor hunt hurry husky hut hymn iceberg
icon idea idle igloo image inch index indigo infant ink inlet inner input insect iris iron island issue ivory
ivy jacket jaguar jam jar jasmine jazz jeans jelly jellyfish jester jet jewel jigsaw jingle job jockey jog
join joke jolly journal joy judge juice jumbo jump jungle junior juniper jury kale kangaroo kayak keen kennel
kettle key kick kid kidney kind king kingdom kiosk kite kitten kiwi knee knife knight knit knob knot koala
label lace ladder lady lagoon lake lamb lamp land lane lantern laptop large laser latch lava lavender lawn
layer leaf ledge lemon lemonade lens lentil leopard level lever liberty light lilac lily lime limit linen
lion liquid list little lizard llama loaf lobby lobster local lock locust lodge lofty logic lotus loud lounge
loyal lucky lullaby lumber lunar lunch lyric macaw magic magnet magnolia maize major mammoth mandolin mango
manor maple marathon marble march margin marine market maroon mars marsh mask mast match maze meadow meal
medal melody melon member memo mentor menu meringue merit mesa metal meteor method metro micro midnight midst
mild mile milk mill mimic mind mineral minnow mint minute mirror misty mitten mixer moat model modem mole
moment mongoose monk monsoon month moose morning mosaic moss motel moth motor mound mount mouse mouth movie
muffin mug mule mural museum music mustang mustard myth nail name napkin narrow narwhal nation native nature
navy near neat nebula nectar needle neon nephew nerve nest net never nickel night nimble noble node noise
nomad noodle north nose note novel nugget number nurse nutmeg nylon oak oasis oat oath oatmeal object ocean
octave octopus odd offer office olive omega onion onset opal open opera optic orange orbit orchard orchid
order organ origami origin ostrich otter ounce outer oval oven owl owner oxygen oyster pace paddle page paint
palace palm panda panel panic pantry paper paprika parade parcel park parrot parsley party pasta pastel patch
path patio pause peach peacock peak peanut pear pearl pebble pecan pedal pelican pencil penguin penny pepper
peppermint perch petal phone photo piano pickle picnic pie pier pig pigeon pillow pilot pine pinecone pink
pint pioneer pipe pirate pitch pivot pixel pizza place plain planet plank plant plate platypus play
plaza plenty plum plume plush pocket poem poet polar pole polka pond pony poodle pool poppy porch port potato
pouch powder prairie praise pretzel prism prize proud prune pudding puddle puffin pulse puma pump punch pupil
puppy purple puzzle pyramid quail quaint quake quarry quart quartz queen quest quick quiet quill quilt quirk
quiver quiz quokka quota rabbit raccoon race radar radiant radio radish raft rail rain rainbow rainfall
raisin rake rally ramp ranch range rapid raspberry raven razor ready realm recipe record reef refuge reindeer
relay relic remedy rental reply rescue resort retro rhino rhyme rhythm ribbon rice riddle ridge ring
ripple ritual rival river road robin robot rocket rodeo rogue roof rookie room root rope rose rotor round
route rover royal ruby rudder rugby ruler rumble runway rustic sable saddle safari saffron saga sage sail
salad salmon salon salsa salt salute sand sandal sapphire sardine satchel satin sauce sauna savvy scale
scallop scarf scene scenic scent school scoop scooter scout scrap screen scroll sculpt seal seashell season
seat second secret sedan seed senior sense sequel sequoia serene serve shade shadow shark sharp sheep shelf
shell sherbet shield shift shine ship shirt shore short shovel shrimp sienna siesta signal silent silk silver
simple siren sister sketch ski skill skirt skunk sky skylark slate sled sleek sleep slice slide slope sloth
smart smile smoke snack snail snake sneaker snow snowflake soap soccer sock sofa soft solar solid solo sonic
sonnet sorbet soup south space spark sparrow spice spider spike spin spinach spiral spoon sport spring sprout
spruce squad squash squid stable stage stairs stamp star starfish statue steady steam steel stem step stereo
stick stingray stone stool storm story stove straw stream street stripe studio sugar suit summer summit sun
sunflower sunny sunset super surf swamp swan sweater sweet swift swim swing symbol syrup table tablet tackle
taco tadpole tail talent tambourine tangerine tango tank tape target tarot task taxi tea teacher teacup team
teapot temple tempo tennis tent term thaw theme thick thimble thistle thorn thread thrill throne thumb
thunder ticket tide tiger tile timber timid tin tiny tip toast toboggan today token tomato tone tonic tool
topaz topiary torch tornado total totem toucan tour towel tower town toy track trade trail train tram travel
tray treasure treat tree trellis trend trial tribe trick trio trophy trout truck truffle trumpet trunk trust
tuba tugboat tulip tumble tuna tundra tunnel turkey turnip turquoise turtle tutor tuxedo twig twin twist
tycoon ukulele ultra umbrella uncle under unicorn union unit upbeat upper urban usher utmost vacuum vagabond
valley valve vanilla vapor vase vault velcro velvet vendor venom venue verb verse vessel vest veteran video
view villa vine vinyl violet violin viper visa visit visor vital vivid vocal voice volcano volume vortex
voyage wafer waffle wagon waist walkway walnut walrus wand warbler warm wasabi watch water waterfall wave wax
wealth weasel weave web wedge whale wheat wheel whisk whistle wicker widget wildcat willow wind window wing
winter wire wisdom wizard wolf wonder wood woodland wool word work world worm wren wrist xylophone yacht yak
yard yarn year yeast yellow yeti yodel yoga yogurt yolk young yummy zebra zen zeppelin zero zest zigzag zinc
zipper zodiac zone zoom zucchini
`
  .trim()
  .split(/\s+/)
