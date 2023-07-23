const fs = require('fs')

const replace_parts = [
    {target: "arm_l", plan: ["arm_l", "arm_r", "leg_l", "leg_r"]},
    {target: "ARM_L", plan: ["ARM_L", "ARM_R", "LEG_L", "LEG_R"]},
    {target: "左腕", plan: ["左腕", "右腕", "左脚", "右脚"]},
    {target: "hand_l", plan: ["hand_l", "hand_r", "foot_l", "foot_r"]},
    {target: "armset", plan: ["arm", "arm", "leg", "leg"]},
]

const base_grade = {
    name: "ロボット義肢",
    prefix: "robotic_limb",
    material: [ "steel", "plastic" ]
}
const target_grade = [
    {
        name: "ロボット義肢",
        prefix: "robotic_limb",
        override: [
            {
                type: "GENERIC",
                material: [ "steel", "plastic" ],
                description: "大変動以前の技術で作られたロボット義肢です。日常生活において本来の四肢とほとんど変わらない動きを可能とします。"
            }
        ],
        override_arm: [
            {
                type: "mutation",
                passive_mods: {"str_mod": 2},
            }
        ],
        override_leg: [
            {
                type: "mutation",
                passive_mods: {"dex_mod": 2},
            }
        ],
    },
    {
        name: "廉価ロボット義肢",
        prefix: "lesser_robotic_limb",
        override: [
            {
                type: "GENERIC",
                material: [ "iron", "plastic" ],
                description: "大変動以前の技術で作られたロボット義肢です。比較的安価で性能もまずまずなのでそれなりの数が出回りました。細かい作業は苦手ですが、日常生活には概ね支障はないでしょう。"
            }
        ],
        override_arm: [
            {
                type: "mutation",
                passive_mods: {"str_mod": 2},
            }
        ],
        override_leg: [
            {
                type: "mutation",
                passive_mods: {"dex_mod": 2},
            }
        ],
    },
    {
        name: "木製義肢",
        prefix: "wooden_limb",
        override: [
            {
                type: "GENERIC",
                material: [ "wood", "plastic" ],
                description: "人間の手足を模して作られた木製の安価な義肢です。何もないよりはマシですが、細かい作業はほとんどできません。"
            }
        ],
        override_arm: [
            {
                type: "mutation",
                passive_mods: {"str_mod": 1},
            }
        ],
        override_leg: [
            {
                type: "mutation",
                passive_mods: {"dex_mod": 1},
            }
        ],
    },
    {
        name: "強化ロボット義肢",
        prefix: "enforced_robotic_limb",
        override: [
            {
                type: "GENERIC",
                material: [ "steel", "plastic" ],
                description: "大変動以前の技術で作られたロボット義肢です。一般に出回っていたものの中ではかなり高い性能を持ち、場合によっては本来の四肢の機能を上回ります。"
            }
        ],
        override_arm: [
            {
                type: "mutation",
                passive_mods: {"str_mod": 3},
            }
        ],
        override_leg: [
            {
                type: "mutation",
                passive_mods: {"dex_mod": 3},
            }
        ],
    }
]

const template = fs.readFileSync("template.json", encoding="utf8")
const template_internal = fs.readFileSync("template_internal.json", encoding="utf8")

target_grade.forEach(t => {
    var grade_template = template
    var grade_template_internal = template_internal
    grade_template = grade_template.replace(new RegExp(base_grade.name, 'g'), t.name)
    grade_template_internal = grade_template_internal.replace(new RegExp(base_grade.name, 'g'), t.name)
    grade_template = grade_template.replace(new RegExp(base_grade.prefix, 'g'), t.prefix)
    grade_template_internal = grade_template_internal.replace(new RegExp(base_grade.prefix, 'g'), t.prefix)

    const json_process = (j, part) => {
        t.override.forEach(e => {
            if(e.type == j.type) {
                for(const key in e) {
                    j[key] = e[key]
                }
            }
        })
        if(part == "arm_l" || part == "arm_r"){
            t.override_arm.forEach(e => {
                if(e.type == j.type) {
                    for(const key in e) {
                        j[key] = e[key]
                    }
                }
            })
        }
        if(part == "leg_l" || part == "leg_r"){
            t.override_leg.forEach(e => {
                if(e.type == j.type) {
                    for(const key in e) {
                        j[key] = e[key]
                    }
                }
            })
        }
        return j
    }
    var ig = {
        id: "ig_" + t.prefix,
        type: "item_group",
        items: []
    }
    var generated = []
    var generated_internal = []
    for(var i = 0; i < 4; i++) {
        const part = replace_parts[0].plan[i]
        var res = grade_template
        var res_internal = grade_template_internal
        replace_parts.forEach(e => {
            res = res.replace(new RegExp(e.target, 'g'), e.plan[i])
            res_internal = res_internal.replace(new RegExp(e.target, 'g'), e.plan[i])
        })
        JSON.parse(res).forEach(e => {
            generated.push(json_process(e, part))
        })
        JSON.parse(res_internal).forEach(e => {
            generated_internal.push(json_process(e, part))
        })
        ig.items.push([
            t.prefix + "_" + part,
            10
        ])
    }

    generated.push(ig)

    if(!fs.existsSync("json/" + t.prefix)) {
        fs.mkdirSync("json/" + t.prefix)
    }
    fs.writeFileSync("json/" + t.prefix + "/" + t.prefix + ".json", JSON.stringify(generated, null, "  "))
    fs.writeFileSync("json/" + t.prefix + "/" + "internal.json", JSON.stringify(generated_internal, null, "  "))
})
