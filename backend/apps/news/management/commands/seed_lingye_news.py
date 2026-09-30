import shutil
from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils.text import slugify

from apps.news.models import AluminumBlogTopic, Article, Tag


ARTICLES = [
    {
        'title': '2020 vs 3030 vs 4040 vs 4545 T-Slot Profiles: How to Choose',
        'slug': 'choose-2020-3030-4040-4545-t-slot-profiles',
        'keyword': 'T-slot aluminium profile sizes',
        'excerpt': 'Compare common 2020, 3030, 4040 and 4545 T-slot profile families by frame envelope, load path, available connectors and project constraints.',
        'image': '4040-aluminium-t-slot.png',
        'tags': ['T-Slot', 'Aluminium Extrusion'],
        'meta_description': 'A practical guide to selecting 2020, 3030, 4040 or 4545 T-slot aluminium profiles, with compatibility checks for slots and connectors.',
        'content': '''<p>Choosing a T-slot profile is not simply a matter of picking the largest section. The right starting point is the frame envelope, the loads it must carry, how it will be assembled and whether compatible connectors are available.</p>
<h2>Start with the nominal section</h2>
<p>The numbers in 2020, 3030, 4040 and 4545 commonly describe nominal outside dimensions in millimetres. A 2020 member is compact and useful where space and low mass matter. 3030 provides a wider section for general frames. 4040 and 4545 offer larger envelopes for applications that need a stiffer structure or more mounting faces.</p>
<p>These names do not define every detail. Slot opening, slot depth, core geometry, alloy, temper and dimensional tolerances can differ between profile families and suppliers.</p>
<h2>Match the section to the frame</h2>
<ul><li><strong>2020:</strong> compact enclosures, guards, light-duty fixtures and small equipment frames.</li><li><strong>3030:</strong> medium-size fixtures, workstations and modular structures where more mounting room is useful.</li><li><strong>4040:</strong> machine frames, larger guards and supports where the design benefits from a larger section.</li><li><strong>4545:</strong> projects with a larger structural envelope or a need for additional mounting faces.</li></ul>
<p>These are starting points, not load ratings. Span, unsupported length, joint design, load direction, vibration and safety factors all affect performance. Have the design checked for the actual operating conditions.</p>
<h2>Check compatibility before ordering</h2>
<p>Confirm the slot width and profile series against the intended T-nuts, brackets, end fasteners and panels. Two profiles with the same outside dimensions may not accept the same hardware. If the frame combines profiles from different sources, request section drawings and verify the interfaces before cutting or assembly.</p>
<h2>A useful RFQ checklist</h2>
<p>Send the profile series or section drawing, required cut lengths, quantity, finish, connector requirements and the frame's intended use. For a custom section, include a dimensioned drawing and identify critical interfaces. This gives the supplier enough context to check fit and manufacturing details before an order is placed.</p>
<p>The best profile is the smallest compatible section that satisfies the documented design requirements, not automatically the heaviest one.</p>''',
    },
    {
        'title': 'Planning a T-Slot Aluminium Frame: Loads, Joints and a Drawing Checklist',
        'slug': 'planning-a-t-slot-aluminium-frame',
        'keyword': 'T-slot aluminium frame design',
        'excerpt': 'Plan a modular T-slot frame around real loads, spans, joints and service needs, then make the drawing clear enough to review and quote.',
        'image': '3030-series-aluminium-t-slot.jpg',
        'tags': ['T-Slot', 'Design Guide'],
        'meta_description': 'A practical checklist for T-slot frame planning, including load cases, profile spans, connector details, panels and drawing notes.',
        'content': '''<p>A reliable modular frame begins with the job it needs to do. Before selecting extrusion or connectors, write down what the frame supports, how people or equipment interact with it, and what must remain adjustable after installation.</p>
<h2>Define the load cases</h2>
<p>Record the weight and position of equipment, panels, doors and accessories. Note whether loads are static, moving, impact-related or repeated. Include the direction of each load and any forces introduced by opening doors, sliding components or attached machinery.</p>
<p>Profile size alone cannot establish frame capacity. Member span, orientation, joints, anchoring, deflection limits and the condition of the supporting floor or structure all matter. For load-bearing or safety-related equipment, have a qualified engineer review the design and specify suitable safety factors.</p>
<h2>Think about joints and access</h2>
<p>Choose connections that suit the assembly sequence and the expected service access. Internal fasteners can keep faces clear, while external brackets can make adjustment or field assembly more straightforward. Confirm connector compatibility with the exact slot geometry and leave access for tools and fasteners.</p>
<p>Plan panel grooves, doors, hinges, cable routes and levelling feet early. Adding these details after the frame is sized can force rework or create inaccessible fasteners.</p>
<h2>Make the drawing reviewable</h2>
<ul><li>Overall dimensions and member cut lengths.</li><li>Profile series or section drawings, including slot orientation.</li><li>Connector type, fastener direction and any required machining.</li><li>Panel material, thickness, edge treatment and installation method.</li><li>Finish, quantity, tolerances and any cosmetic faces.</li><li>Assembly view, revision number and destination requirements.</li></ul>
<h2>Review before release</h2>
<p>Check that every joint can be assembled in sequence, that fasteners remain reachable and that the frame can be moved or anchored as planned. Identify interfaces that must align with other equipment and mark them as critical dimensions. When the drawing changes, update its revision so quotation and production refer to the same design.</p>
<p>A clear design package helps the supplier raise compatibility questions before manufacture. It also makes later changes easier to track and verify.</p>''',
    },
    {
        'title': 'Aluminium Extrusion RFQ Checklist: What to Include with Your Drawing',
        'slug': 'aluminium-extrusion-rfq-checklist',
        'keyword': 'aluminium extrusion RFQ checklist',
        'excerpt': 'A concise checklist for requesting an aluminium extrusion quote, covering drawings, alloy, temper, finish, quantities and downstream processing.',
        'image': 'custom-profile2.jpg',
        'tags': ['RFQ', 'Aluminium Extrusion'],
        'meta_description': 'Prepare a clearer aluminium extrusion RFQ with profile drawings, alloy and temper, tolerances, finish, lengths, quantities and machining notes.',
        'content': '''<p>A quote request is easier to assess when the supplier can see both the profile and how it will be used. A complete package reduces avoidable assumptions and makes supplier responses easier to compare.</p>
<h2>1. Identify the profile</h2>
<p>Attach a dimensioned cross-section drawing with units, wall thicknesses, critical dimensions and tolerances. Mark the revision clearly. A PDF is convenient for review; include a native CAD file such as STEP or DWG when available and appropriate. For an existing standard profile, state its series and provide the supplier's reference drawing if you have one.</p>
<h2>2. State material requirements</h2>
<p>Specify the alloy and temper if they are already defined by the design. If they are not, describe the functional requirements and ask the supplier to propose an option for engineering approval. Do not assume that similar-looking profiles have identical mechanical properties.</p>
<h2>3. Describe the order quantity and delivery form</h2>
<ul><li>Estimated annual demand and initial order quantity.</li><li>Required cut lengths, acceptable length variation and whether bars or cut pieces are needed.</li><li>Packaging, labelling and delivery destination.</li><li>Target schedule or required delivery window, if known.</li></ul>
<h2>4. Specify finish and processing</h2>
<p>State the surface finish and colour reference where relevant, and identify which faces are cosmetic or mating surfaces. List secondary operations such as cutting, drilling, tapping, CNC machining, deburring or protective film. Attach drawings for machined parts and define inspection points for critical features.</p>
<h2>5. Explain interfaces and approval needs</h2>
<p>Show how the extrusion connects to fasteners, panels, seals or other components. Include connector references or mating-part drawings where fit is critical. Note whether a sample, first-article review, inspection record or other approval step is required before a production order.</p>
<h2>Before sending</h2>
<p>Check that drawing units, revision, quantities and finish requirements agree across all files. Separate confirmed requirements from open questions. A short note describing the application can help the supplier flag a mismatch, but it does not replace design validation for structural or safety-critical parts.</p>
<p>With these details in one package, both sides can clarify scope earlier and compare quotations on a more consistent basis.</p>''',
    },
    {
        'title': 'Anodizing, Powder Coating or Wood Grain? Selecting an Aluminium Finish',
        'slug': 'selecting-an-aluminium-profile-finish',
        'keyword': 'aluminium profile surface finishes',
        'excerpt': 'Compare common aluminium profile finishes by appearance, intended environment, maintenance and project constraints before specifying a surface treatment.',
        'image': 'wood-grain.jpg',
        'tags': ['Surface Finishing', 'Aluminium Extrusion'],
        'meta_description': 'Compare anodizing, powder coating and wood-grain finishes for aluminium profiles, and learn what to confirm before ordering.',
        'content': '''<p>The finish affects more than colour. It can influence appearance, cleaning, fit at interfaces and how consistently multiple batches match. Select it with the application and the mating parts in mind.</p>
<h2>Anodizing</h2>
<p>Anodizing forms an oxide layer as part of the aluminium surface. It is commonly selected for a clean metallic appearance and architectural or equipment applications. Colour and appearance can vary with alloy, extrusion surface and batch. Confirm the available colour range, sample approval method and any masking requirements with the supplier.</p>
<h2>Powder coating</h2>
<p>Powder coating provides a broad palette of colours and surface effects. It can suit projects where a uniform painted appearance is important. Confirm the specified colour reference, gloss or texture, coating coverage and protection of threaded or close-fit areas. If profiles from separate batches must match, agree on a sample or approved reference.</p>
<h2>Wood-grain appearance</h2>
<p>Wood-grain finishes are used when a timber-like visual effect is desired while retaining an aluminium profile. They are often considered for doors, windows and interior details. Pattern direction, colour variation and coordination across adjoining lengths should be reviewed on representative samples before production.</p>
<h2>Choose by the whole assembly</h2>
<ul><li>Describe the indoor or outdoor environment and expected cleaning routine.</li><li>Identify faces visible after assembly and faces that must mate closely.</li><li>Check whether fastener slots, drilled holes or cut ends need additional treatment.</li><li>Request confirmation of finish availability for the selected alloy, profile and order size.</li><li>Approve a physical sample when colour or texture is important.</li></ul>
<p>Finish names alone do not define performance. If a project has requirements for corrosion exposure, colour tolerance, coating thickness or a named standard, state them explicitly and confirm how they will be measured and documented.</p>
<p>Sharing the profile drawing, use environment, colour reference and sample expectations early gives the supplier a clearer basis for checking the finish before production.</p>''',
    },
    {
        'title': 'A Clear Project Cooperation Workflow for Custom Aluminium Profiles',
        'slug': 'custom-aluminium-profile-project-workflow',
        'keyword': 'custom aluminium profile project workflow',
        'excerpt': 'A transparent project workflow for custom aluminium profiles, from inquiry and drawing review to sample approval, production coordination and shipment documents.',
        'image': 'cnc-parts2.webp',
        'tags': ['Project Cooperation', 'Aluminium Extrusion'],
        'meta_description': 'See the typical stages of a custom aluminium profile project and the drawings, approvals and decisions to align at each step.',
        'content': '''<p>Custom extrusion projects involve more than a profile drawing. Clear ownership of specifications, revisions and approvals helps keep the buyer and supplier aligned from inquiry through delivery.</p>
<h2>1. Share the application and requirements</h2>
<p>Start with a section drawing or CAD file, alloy and temper requirements, finish, target lengths, estimated quantities and destination. Explain the application and identify critical dimensions or visible faces. If some requirements are still open, list them as questions rather than leaving them implicit.</p>
<h2>2. Review feasibility and quotation scope</h2>
<p>The supplier reviews the section and requested processing, then clarifies assumptions, open dimensions and the scope included in the quotation. Confirm whether the proposal covers extrusion only or also includes cutting, machining, finishing, packing or delivery. Tooling, minimum quantities, lead times and samples should be confirmed for the specific project rather than assumed.</p>
<h2>3. Align drawings and approvals</h2>
<p>Keep a revision-controlled drawing set. Review any proposed changes to wall thickness, tolerances, interfaces or finish before approval. Where fit, colour or appearance matters, agree whether a sample or first-article check is needed and what acceptance criteria apply.</p>
<h2>4. Coordinate production and inspection</h2>
<p>Before a production order is released, confirm the approved revision, quantity, finish, cut lengths, packing instructions and delivery details. Agree on inspection records or checkpoints required by the purchase order. If a schedule or specification changes, document the change and its impact before proceeding.</p>
<h2>5. Close the loop on delivery</h2>
<p>Confirm labels, bundle or carton details, shipping documents and the receiving contact. After delivery, record any fit or finish feedback against the relevant drawing revision so future orders have a clear reference.</p>
<p>At Lingye Aluminum, this is a practical coordination framework for custom-profile inquiries. The exact process, services, samples and inspection documents depend on the confirmed quotation, order scope and project agreement. No customer reference or project result should be inferred from this general workflow.</p>''',
    },
    {
        'title': '6061 vs 6063 Aluminium: How to Choose an Alloy and Temper',
        'slug': '6061-vs-6063-aluminium-alloy-selection',
        'keyword': '6061 vs 6063 aluminium',
        'excerpt': 'Choose between 6061 and 6063 by balancing structural requirements, extrusion complexity, surface appearance, machining and the specified temper.',
        'image': 'custom-profile2.jpg',
        'tags': ['Material Selection', 'Design Guide'],
        'meta_description': 'Compare 6061 and 6063 aluminium for custom extrusions. Understand temper, strength, finish and the questions to resolve before ordering.',
        'content': '''<p>6061 and 6063 are both widely used 6xxx-series aluminium alloys, but they are not interchangeable labels. The right choice depends on the section geometry, required properties after processing, surface expectations and how the part will be used. Start with the design requirement, not with a generic claim that one alloy is always stronger or better.</p>
<h2>What the alloy choice changes</h2>
<p>6061 is frequently considered where a project needs a balance of strength, machinability and general engineering use. 6063 is commonly selected for extruded sections where surface appearance, thin or detailed geometry and architectural or enclosure applications matter. Actual results depend on the product form, section, temper, dimensions and production route; the alloy designation alone does not establish a finished part's allowable load.</p>
<p>For an extrusion, also consider whether the desired cross-section can be produced reliably. Wall-thickness variation, narrow openings, long unsupported features and hollow cavities affect die design and process stability. Discuss the section with the extrusion supplier before locking the material and geometry together.</p>
<h2>Temper is part of the specification</h2>
<p>Temper describes the material condition and heat-treatment history, such as T5 or T6. It affects mechanical properties and can influence the sequence of extrusion, quenching, artificial ageing and machining. Do not write “6061” or “6063” alone when the design depends on strength or hardness. State the required temper or ask for a proposal tied to the drawing and intended service conditions.</p>
<h2>A practical selection sequence</h2>
<ol><li><strong>Define the function:</strong> identify loads, supports, spans, movement, vibration and any safety-related duty.</li><li><strong>Set the finish priority:</strong> note visible faces, anodized colour expectations, coating and cosmetic limits.</li><li><strong>Review manufacturability:</strong> share the section drawing and ask about minimum walls, hollows, slots and likely die constraints.</li><li><strong>Confirm downstream work:</strong> list CNC features, joining, bending or assembly interfaces that may affect material condition.</li><li><strong>Agree verification:</strong> specify the applicable material standard, inspection evidence and acceptance criteria in the purchase documents.</li></ol>
<h2>What to send with an inquiry</h2>
<p>Provide a revision-controlled section drawing, alloy and temper if already approved by engineering, critical dimensions, quantity, cut length, finish, machining details and application environment. If the alloy is undecided, state the functional target and request a technically supported option for your engineer to approve. Ask the supplier to identify the standard and documentation included in the quotation.</p>
<p><strong>Important:</strong> this guide is for early procurement discussion, not a structural calculation or material certification. A qualified engineer should validate load-bearing and safety-critical parts using the actual geometry, support conditions and governing design rules.</p>''',
    },
    {
        'title': 'Designing an Extrusion Cross-Section: A Die-Readiness Checklist',
        'slug': 'aluminium-extrusion-cross-section-die-design-guide',
        'keyword': 'aluminium extrusion die design',
        'excerpt': 'Reduce avoidable die revisions by reviewing wall balance, hollow features, radii, tolerances and functional interfaces before releasing a custom profile drawing.',
        'image': 'aluminium-profile-engineering.webp',
        'tags': ['Custom Profiles', 'Design Guide'],
        'meta_description': 'A practical die-readiness checklist for custom aluminium extrusion drawings, including wall balance, hollows, radii and critical interfaces.',
        'content': '''<p>A custom extrusion drawing is also a manufacturing proposal. A section that looks simple in CAD can be difficult to extrude if material flow is unbalanced, walls vary sharply or narrow features create fragile die details. A short design-for-extrusion review before tooling can prevent a long cycle of drawing changes and sample corrections.</p>
<h2>1. Make the section manufacturable</h2>
<p>Where function permits, keep wall thickness reasonably consistent and transitions gradual. Large differences in metal mass across the section can make flow and dimensional control more difficult. Avoid sharp internal corners; practical radii can improve metal flow and reduce stress concentration in the part. The appropriate values depend on alloy, section size, press and die design, so confirm them with the proposed production source rather than applying a universal rule.</p>
<p>Long, thin projections, narrow slots and deep channels deserve early review. They can challenge die strength, cooling and profile straightness. If a feature is not essential, simplifying or thickening it may improve feasibility. If it is essential, mark it clearly and ask for a manufacturability assessment.</p>
<h2>2. Treat hollow sections as a special case</h2>
<p>Hollow profiles usually require a die design that forms and joins metal flow around internal features. Identify every cavity, opening and joining interface in the drawing. Pay attention to enclosed hollows, thin bridges and narrow openings, and share assembly or sealing requirements so the supplier can assess the geometry. Never assume a hollow profile can use the same tooling approach, cost or minimum order as a simple solid section.</p>
<h2>3. Put tolerances where they matter</h2>
<p>Applying very tight tolerances to every dimension can raise tooling, inspection and production costs without improving function. Mark critical dimensions at interfaces such as a mating slot, bearing surface, seal land or fastener position. Separate functional tolerances from general tolerances and state the measurement method or datum where it matters. Confirm which tolerances apply before quoting.</p>
<h2>4. Design for finishing and machining</h2>
<p>Identify cosmetic faces, contact faces and surfaces that will be masked. Anodizing and coating can change dimensions and affect fit, so close-clearance features may need a defined finishing allowance or post-finish machining. Show holes, threads, cut-outs and CNC operations on a separate, revision-matched machining drawing when that makes inspection clearer.</p>
<h2>Before authorizing tooling</h2>
<ul><li>Confirm units, scale, revision and material designation.</li><li>Mark critical dimensions, datums, cosmetic faces and mating parts.</li><li>Review wall balance, radii, narrow openings, hollows and long projections.</li><li>Specify finish, colour sample expectations and any masked areas.</li><li>Agree tooling scope, sample quantity, approval criteria and ownership terms in writing.</li></ul>
<p>Send both a dimensioned PDF and a usable CAD exchange file where available. Include annual demand estimates, initial quantity, cut lengths and destination because these can affect the commercial proposal. A supplier's feasibility comments do not replace the design authority's approval of function, strength or regulatory compliance.</p>''',
    },
    {
        'title': 'How Aluminium Extrusion Works: From Billet to Finished Profile',
        'slug': 'aluminium-extrusion-process-from-billet-to-profile',
        'keyword': 'aluminium extrusion process steps',
        'excerpt': 'Follow the main production stages from billet preparation and die setup through stretching, ageing, cutting, finishing and inspection, with buyer checkpoints at each stage.',
        'image': 'factory-extrusion-lines.webp',
        'tags': ['Manufacturing Process', 'Aluminium Extrusion'],
        'meta_description': 'Understand the aluminium extrusion process and learn what buyers should confirm about samples, dimensions, finish and inspection.',
        'content': '''<p>Understanding the extrusion route helps buyers ask better questions and place inspection at the right points. Exact equipment, parameters and sequence vary by profile, alloy and production source, but most projects move through a recognisable set of stages.</p>
<h2>1. Billet preparation and die setup</h2>
<p>An aluminium billet is prepared and heated to a controlled processing range. The die is installed and brought to operating conditions. Die design, alloy, press capability and profile complexity all influence the setup. For a custom section, the released drawing and approved revision must match the tooling plan before a trial begins.</p>
<h2>2. Extrusion and cooling</h2>
<p>The press forces heated aluminium through the die opening to form a continuous profile. The emerging profile is cooled using a process appropriate to the alloy and target condition. At this point, the metal is not yet necessarily in its final straightness, temper or cut-length condition.</p>
<h2>3. Stretching, ageing and cutting</h2>
<p>After cooling, profiles may be stretched to correct residual distortion, cut to manageable lengths and heat-treated to achieve the specified temper. Sequence and conditions depend on material and product requirements. If mechanical properties are critical, agree on the material designation, temper and supporting inspection documentation in the order specification.</p>
<h2>4. Finishing and secondary operations</h2>
<p>Profiles can then be cut to order, machined, deburred and surface-finished. Anodizing, powder coating and other treatments have different appearance and dimensional considerations. Identify cosmetic faces, close-fit features, masking needs and sample approval requirements before processing. Keep the drawing revision aligned across extrusion and machining operations.</p>
<h2>5. Inspection, packing and shipment</h2>
<p>Inspection should be tied to the agreed drawing and acceptance criteria. Typical checks may include section dimensions, cut length, appearance, machining features and finish, but the exact plan must be agreed for the project. Packaging should protect long profiles and finished surfaces from movement, abrasion and moisture exposure appropriate to the route and destination.</p>
<h2>Buyer checkpoints that prevent surprises</h2>
<ul><li>Before tooling: approve the section drawing, alloy/temper proposal and tooling scope.</li><li>At sampling: define which dimensions, interfaces, appearance and finish are acceptance items.</li><li>Before production: confirm the approved sample or first-article status and final drawing revision.</li><li>Before shipment: agree quantities, labels, protective packaging and required documents.</li></ul>
<p>For Lingye Aluminum inquiries, production steps and available records are confirmed with the selected production partner and stated in the project quotation. A process overview is not a claim that every facility uses identical equipment or that a specific inspection document is automatically included.</p>''',
    },
    {
        'title': 'CNC Machining Aluminium Profiles: Tolerances, Datums and Inspection',
        'slug': 'cnc-machined-aluminium-profile-tolerances-inspection',
        'keyword': 'CNC machining aluminium profiles',
        'excerpt': 'Help machining suppliers quote and inspect extrusion parts consistently by defining datums, critical features, burr limits, finish sequence and sample approval.',
        'image': 'cnc-parts2.webp',
        'tags': ['CNC Machining', 'Quality Control'],
        'meta_description': 'Specify CNC-machined aluminium profiles clearly with datum references, critical tolerances, deburring, finish sequence and inspection checkpoints.',
        'content': '''<p>When an extruded profile is converted into a machined component, the extrusion drawing alone is rarely enough. Hole positions, end cuts, slots and interfaces need a shared datum scheme so the part can be made and inspected consistently.</p>
<h2>Build the drawing around assembly function</h2>
<p>Show how the finished part locates in the assembly. Choose datums that reflect the real mating surfaces and establish the origin and orientation for hole patterns or cut features. Avoid dimension chains when a feature's position is important; reference it to a clear datum or use a suitable geometric tolerance scheme reviewed by the design authority.</p>
<p>Separate extrusion dimensions from machined dimensions where helpful. State whether dimensions apply before or after anodizing or coating. If machining crosses a cosmetic surface, specify the acceptable tool marks and whether the face needs a secondary finish.</p>
<h2>Do not over-tighten every feature</h2>
<p>Tolerances should reflect fit and function. A tight tolerance may require slower machining, dedicated fixturing and more inspection. Identify critical-to-function dimensions and explain their role. For non-critical dimensions, use an agreed general tolerance rather than silently assuming a universal standard. Confirm measurement capability for the feature and part size before the order is released.</p>
<h2>Cover the details that cause assembly trouble</h2>
<ul><li>Thread size, depth, class and whether threads must remain clear after finishing.</li><li>Hole position, countersink/counterbore dimensions and entry side.</li><li>Cut-end squareness, burr limits and edge-break requirements.</li><li>Slot or groove machining limits and the surfaces used for clamping.</li><li>Masking, protective film and handling of cosmetic faces.</li></ul>
<h2>Agree a useful first-article check</h2>
<p>For a new or revised part, define the sample quantity and inspection characteristics before production. A first-article report is only useful when both parties agree which drawing revision, measurement method and results it covers. For recurring orders, clarify whether inspection is performed per batch, at defined intervals or on specified characteristics.</p>
<h2>RFQ package for a machined extrusion</h2>
<p>Send the extrusion section and its material/temper, a revision-controlled machining drawing, 3D model where available, finish specification, expected quantity, cut length, critical dimensions and destination. Add photographs or assembly drawings only as supplements; they do not replace dimensions and tolerances. Ask the supplier to list quotation assumptions and any features that need clarification.</p>
<p>Inspection scope and records vary by project. Put the required report, sampling plan and acceptance criteria in the purchase documents rather than assuming they are included.</p>''',
    },
    {
        'title': 'Aluminium Heat Sink Profile Design: Fins, Airflow and Interface',
        'slug': 'aluminium-heat-sink-profile-design-guide',
        'keyword': 'aluminium heat sink extrusion design',
        'excerpt': 'A practical thermal-design handoff for extrusion buyers: define heat load, airflow, mounting interface and test conditions before choosing a fin profile.',
        'image': 'heat-sink-profile.jpg',
        'tags': ['Heat Sink', 'Application Guide'],
        'meta_description': 'Design a more reviewable aluminium heat sink extrusion by documenting heat load, airflow, mounting, contact surface and thermal test conditions.',
        'content': '''<p>A heat sink is not effective just because it has many fins. Thermal performance depends on the heat source, contact interface, airflow, orientation, surrounding enclosure and operating conditions. The extrusion profile must support a system-level thermal design rather than stand in for one.</p>
<h2>Start with the operating conditions</h2>
<p>Document the heat generated, allowable component temperature, ambient range, duty cycle and available airflow. State whether cooling is natural convection or forced air, and include the fan direction and approximate flow conditions if known. Include the enclosure and nearby obstructions because they can restrict the air path.</p>
<h2>Balance fin geometry with manufacturability</h2>
<p>Fin height, thickness, spacing and base thickness influence surface area, air movement, weight and extrusion feasibility. Closely packed fins can increase area but may impede airflow or be harder to produce consistently. A thin base may reduce material but can create a longer heat-spreading path or complicate mounting. Ask the extrusion source to review the section for die feasibility and dimensional control; have the thermal engineer evaluate performance.</p>
<h2>Design the interface as carefully as the fins</h2>
<p>Show the component contact area, flatness or surface requirement if specified, fastener locations and mounting pressure assumptions. Thermal interface material, surface finish and contact pressure can materially affect heat transfer. Identify machined faces and state the inspection requirement for any critical contact feature.</p>
<h2>Plan verification before tooling</h2>
<p>Define how performance will be tested: heat input, ambient temperature, orientation, airflow, sensor positions, stabilization time and pass/fail temperature limits. Simulations and supplier calculations depend on their boundary assumptions; compare them only when the assumptions are visible. Validate the final configuration with the intended assembly and operating conditions.</p>
<h2>Information to include in an RFQ</h2>
<ul><li>Profile cross-section, alloy/temper target and overall dimensions.</li><li>Heat load, ambient range, cooling method and target temperature.</li><li>Mounting interface, contact area, fasteners and enclosure constraints.</li><li>Machined features, surface finish, critical tolerances and quantity.</li><li>Whether the quote should include only extrusion or also machining and finishing.</li></ul>
<p>A profile supplier can assess extrusion feasibility and quote the agreed manufacturing scope; thermal validation remains a design responsibility unless analysis and test services are explicitly included in the project agreement.</p>''',
    },
    {
        'title': 'Aluminium Solar Mounting Profiles: Loads, Interfaces and Project Checks',
        'slug': 'aluminium-solar-mounting-profile-design-checklist',
        'keyword': 'aluminium solar mounting profiles',
        'excerpt': 'Plan a solar mounting extrusion around the site loads, module clamps, roof interface, drainage, corrosion exposure and installation tolerances.',
        'image': 'chile-aluminium-profile.webp',
        'tags': ['Solar Mounting', 'Application Guide'],
        'meta_description': 'A project checklist for aluminium solar mounting profiles covering structural loads, module interfaces, corrosion exposure, drainage and installation.',
        'content': '''<p>Solar mounting profiles are part of a structural system, not standalone rails. The correct section depends on the site, support spacing, module layout, clamps, roof or ground interface and governing design requirements. A catalogue profile should not be treated as approved for a project until those conditions have been checked.</p>
<h2>Define the site and load basis</h2>
<p>Record project location, installation type, support spacing, module dimensions and orientation. The responsible engineer should establish applicable wind, snow, seismic and maintenance loads under the relevant local rules, then check rails, splices, clamps, fasteners, anchors and supporting structure as a system. Do not derive allowable spans from profile appearance or nominal size alone.</p>
<h2>Resolve module and mounting interfaces</h2>
<p>Provide the module-frame dimensions and approved clamp zones, rail orientation, slot or channel details, end and mid-clamp references, splice locations and bonding requirements. Check that fasteners can be installed and torqued with the available access. Tolerance stack-up across modules and rail joints can affect alignment and installation time.</p>
<h2>Account for environment and finish</h2>
<p>Describe coastal or industrial exposure, water paths, dissimilar-metal contacts and maintenance expectations. Specify the material and surface treatment requirements against the project's applicable standards. Include drainage and debris considerations in the geometry review, and avoid trapping water where the design can provide a suitable path.</p>
<h2>Make installation practical</h2>
<p>State required rail lengths, splice details, cut-end treatment, hole patterns, labels and packaging sequence. Consider transport limits, handling at the site and whether installers need pre-cut or machined components. Mark visible faces and any dimensions that control module alignment.</p>
<h2>Checklist before quotation</h2>
<ul><li>Site location, installation type and engineer-approved load basis.</li><li>Module interface drawing, clamp zones and fastener specification.</li><li>Support spacing, rail spans, splice and anchoring details.</li><li>Alloy, temper, finish and environmental exposure requirements.</li><li>Lengths, machining, quantity, packaging and required inspection evidence.</li></ul>
<p>For a supplier comparison, ask each respondent to state assumptions, exclusions, profile revision, included operations and required customer approvals. The project engineer must validate structural capacity and code compliance for the actual site; a general application guide or supplier quotation is not a substitute for that review.</p>''',
    },
]


class Command(BaseCommand):
    help = 'Publish the reviewed Lingye aluminium industry articles.'

    @transaction.atomic
    def handle(self, *args, **options):
        asset_dir = Path(settings.BASE_DIR) / 'catalog_assets'
        media_dir = Path(settings.MEDIA_ROOT) / 'articles'
        media_dir.mkdir(parents=True, exist_ok=True)

        for data in ARTICLES:
            cover_name = f"{data['slug']}{Path(data['image']).suffix}"
            cover_path = media_dir / cover_name
            source_path = asset_dir / data['image']
            if not source_path.is_file():
                source_path = settings.BASE_DIR.parent / 'frontend' / 'public' / 'images' / data['image']
            if not source_path.is_file():
                raise FileNotFoundError(f"Article cover asset not found: {data['image']}")
            shutil.copyfile(source_path, cover_path)

            article, _ = Article.objects.update_or_create(
                slug=data['slug'],
                defaults={
                    'title': data['title'],
                    'content': data['content'],
                    'excerpt': data['excerpt'],
                    'status': 'published',
                    'is_featured': False,
                    'meta_title': data['title'],
                    'meta_description': data['meta_description'],
                    'meta_keywords': data['keyword'],
                },
            )
            article.featured_image.name = f"articles/{cover_name}"
            article.save(update_fields=['featured_image', 'updated_at'])

            tags = []
            for name in data['tags']:
                tag, _ = Tag.objects.get_or_create(
                    name=name,
                    defaults={'slug': slugify(name)},
                )
                tags.append(tag)
            article.tags.set(tags)

            topic, _ = AluminumBlogTopic.objects.update_or_create(
                title=data['title'],
                defaults={
                    'slug': data['slug'],
                    'primary_keyword': data['keyword'],
                    'status': 'published',
                    'article': article,
                    'notes': 'Editorial article manually reviewed; not AI-generated customer case material.',
                },
            )
            self.stdout.write(f"Published: {article.slug} (topic {topic.id})")

        self.stdout.write(self.style.SUCCESS(f'Published {len(ARTICLES)} Lingye news articles.'))
