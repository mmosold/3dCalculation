"use client"; 

import React, { useState, useMemo } from 'react';
import { Calculator, DollarSign, Droplets, Zap, Clock, Package, Palette } from 'lucide-react';

export default function ResinPrintCalculator() {
  const [inputs, setInputs] = useState({
    // Model specifications
    volumeMl: 50,
    supportVolumeMl: 10,
    printTimeHours: 8,
    failureRate: 10,
    
    // Material costs
    resinPricePerLiter: 35,
    isopropanolPricePerLiter: 15,
    ipaUsagePerPrint: 50,
    
    // Equipment costs
    printerCost: 300,
    printerLifespanPrints: 2000,
    fepFilmCost: 20,
    fepLifespanPrints: 50,
    buildPlateCost: 30,
    buildPlateLifespanPrints: 500,
    
    // Operational costs
    powerConsumptionWatts: 80,
    electricityPricePerKwh: 0.12,
    uvCuringTimeMinutes: 5,
    uvCuringWatts: 50,
    
    // Labor and overhead
    laborTimeMinutes: 30,
    laborRatePerHour: 20,
    overheadPercentage: 15,
    
    // Painting section - NEW
    includePainting: false,
    paintingComplexity: 'standard' as 'basic' | 'standard' | 'advanced' | 'premium',
    primerCost: 3,
    numberOfColors: 5,
    paintCostPerColor: 3,
    varnishCost: 5,
    brushesCost: 2,
    otherMaterialsCost: 3,
    paintingTimeHours: 4,
    paintingLaborRate: 25,
    paintingFailureRate: 5,
    paintingOverheadPercentage: 15
  });

  const handleChange = (field: keyof typeof inputs, value: string | boolean) => {
    setInputs(prev => ({
      ...prev,
      [field]: typeof value === 'boolean' ? value : (parseFloat(value as string) || 0)
    }));
  };

  // Painting complexity presets
  const paintingPresets = {
    basic: {
      name: 'Базове фарбування',
      numberOfColors: 3,
      paintCostPerColor: 2,
      brushesCost: 1,
      otherMaterialsCost: 2,
      paintingTimeHours: 2,
      paintingFailureRate: 3
    },
    standard: {
      name: 'Стандартне фарбування',
      numberOfColors: 5,
      paintCostPerColor: 3,
      brushesCost: 2,
      otherMaterialsCost: 3,
      paintingTimeHours: 4,
      paintingFailureRate: 5
    },
    advanced: {
      name: 'Просунуте фарбування',
      numberOfColors: 8,
      paintCostPerColor: 4,
      brushesCost: 3,
      otherMaterialsCost: 5,
      paintingTimeHours: 8,
      paintingFailureRate: 8
    },
    premium: {
      name: 'Преміум фарбування',
      numberOfColors: 12,
      paintCostPerColor: 5,
      brushesCost: 5,
      otherMaterialsCost: 10,
      paintingTimeHours: 15,
      paintingFailureRate: 10
    }
  };

  const loadPaintingPreset = (presetKey: keyof typeof paintingPresets) => {
    const preset = paintingPresets[presetKey];
    setInputs(prev => ({
      ...prev,
      paintingComplexity: presetKey,
      numberOfColors: preset.numberOfColors,
      paintCostPerColor: preset.paintCostPerColor,
      brushesCost: preset.brushesCost,
      otherMaterialsCost: preset.otherMaterialsCost,
      paintingTimeHours: preset.paintingTimeHours,
      paintingFailureRate: preset.paintingFailureRate
    }));
  };

  const costs = useMemo(() => {
    const {
      volumeMl, supportVolumeMl, printTimeHours, failureRate,
      resinPricePerLiter, isopropanolPricePerLiter, ipaUsagePerPrint,
      printerCost, printerLifespanPrints, fepFilmCost, fepLifespanPrints,
      buildPlateCost, buildPlateLifespanPrints,
      powerConsumptionWatts, electricityPricePerKwh,
      uvCuringTimeMinutes, uvCuringWatts,
      laborTimeMinutes, laborRatePerHour, overheadPercentage,
      // Painting parameters
      includePainting, primerCost, numberOfColors, paintCostPerColor,
      varnishCost, brushesCost, otherMaterialsCost,
      paintingTimeHours, paintingLaborRate, paintingFailureRate,
      paintingOverheadPercentage
    } = inputs;

    // ===== PRINTING COSTS =====
    // Material costs
    const totalResinMl = volumeMl + supportVolumeMl;
    const resinCost = (totalResinMl / 1000) * resinPricePerLiter;
    const ipaCost = (ipaUsagePerPrint / 1000) * isopropanolPricePerLiter;
    const materialCost = resinCost + ipaCost;

    // Equipment depreciation
    const printerDepreciation = printerCost / printerLifespanPrints;
    const fepDepreciation = fepFilmCost / fepLifespanPrints;
    const buildPlateDepreciation = buildPlateCost / buildPlateLifespanPrints;
    const equipmentCost = printerDepreciation + fepDepreciation + buildPlateDepreciation;

    // Energy costs
    const printEnergyKwh = (powerConsumptionWatts / 1000) * printTimeHours;
    const printEnergyCost = printEnergyKwh * electricityPricePerKwh;
    const uvEnergyKwh = (uvCuringWatts / 1000) * (uvCuringTimeMinutes / 60);
    const uvEnergyCost = uvEnergyKwh * electricityPricePerKwh;
    const energyCost = printEnergyCost + uvEnergyCost;

    // Labor cost
    const laborCost = (laborTimeMinutes / 60) * laborRatePerHour;

    // Subtotal before failure rate
    const printingSubtotal = materialCost + equipmentCost + energyCost + laborCost;

    // Failure rate adjustment
    const printingFailureAdjustment = printingSubtotal * (failureRate / 100);

    // Total before overhead
    const printingTotalBeforeOverhead = printingSubtotal + printingFailureAdjustment;

    // Overhead
    const printingOverhead = printingTotalBeforeOverhead * (overheadPercentage / 100);

    // Final printing total
    const printingTotalCost = printingTotalBeforeOverhead + printingOverhead;

    // ===== PAINTING COSTS =====
    let paintingMaterialCost = 0;
    let paintingLaborCost = 0;
    let paintingSubtotal = 0;
    let paintingFailureAdjustment = 0;
    let paintingTotalBeforeOverhead = 0;
    let paintingOverhead = 0;
    let paintingTotalCost = 0;

    // Breakdown painting materials
    let totalPaintsCost = 0;
    
    if (includePainting) {
      // Calculate material costs
      totalPaintsCost = numberOfColors * paintCostPerColor;
      paintingMaterialCost = primerCost + totalPaintsCost + varnishCost + brushesCost + otherMaterialsCost;
      
      // Calculate labor cost
      paintingLaborCost = paintingTimeHours * paintingLaborRate;
      
      // Subtotal
      paintingSubtotal = paintingMaterialCost + paintingLaborCost;
      
      // Failure rate adjustment
      paintingFailureAdjustment = paintingSubtotal * (paintingFailureRate / 100);
      
      // Total before overhead
      paintingTotalBeforeOverhead = paintingSubtotal + paintingFailureAdjustment;
      
      // Overhead
      paintingOverhead = paintingTotalBeforeOverhead * (paintingOverheadPercentage / 100);
      
      // Final painting total
      paintingTotalCost = paintingTotalBeforeOverhead + paintingOverhead;
    }

    // ===== COMBINED TOTAL =====
    const combinedTotalCost = printingTotalCost + paintingTotalCost;

    return {
      // Printing costs
      resinCost,
      ipaCost,
      materialCost,
      printerDepreciation,
      fepDepreciation,
      buildPlateDepreciation,
      equipmentCost,
      printEnergyCost,
      uvEnergyCost,
      energyCost,
      laborCost,
      printingSubtotal,
      printingFailureAdjustment,
      printingTotalBeforeOverhead,
      printingOverhead,
      printingTotalCost,
      
      // Painting costs
      primerCost,
      totalPaintsCost,
      varnishCost,
      brushesCost,
      otherMaterialsCost,
      paintingMaterialCost,
      paintingLaborCost,
      paintingSubtotal,
      paintingFailureAdjustment,
      paintingTotalBeforeOverhead,
      paintingOverhead,
      paintingTotalCost,
      
      // Combined
      combinedTotalCost
    };
  }, [inputs]);

  const presets = {
    miniature: {
      name: "Міні фігурка (28мм)",
      volumeMl: 5,
      supportVolumeMl: 2,
      printTimeHours: 3,
      failureRate: 5
    },
    standard: {
      name: "Стандартна фігура (10см)",
      volumeMl: 50,
      supportVolumeMl: 10,
      printTimeHours: 8,
      failureRate: 10
    },
    large: {
      name: "Велика статуя (20см)",
      volumeMl: 200,
      supportVolumeMl: 40,
      printTimeHours: 16,
      failureRate: 15
    },
    bust: {
      name: "Детальний бюст (15см)",
      volumeMl: 120,
      supportVolumeMl: 25,
      printTimeHours: 12,
      failureRate: 12
    }
  };

  const loadPreset = (preset: Partial<typeof inputs>) => {
    setInputs(prev => ({
      ...prev,
      ...preset
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Calculator className="w-10 h-10 text-purple-400" />
            <h1 className="text-4xl font-bold text-white">Калькулятор вартості 3D друку смолою</h1>
          </div>
          <p className="text-purple-200">Розрахунок повної вартості друку смоляних фігур</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Input Panel */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-purple-300/20">
            <h2 className="text-2xl font-bold text-white mb-4">Вхідні параметри</h2>
            
            {/* Presets */}
            <div className="mb-6">
              <label className="block text-purple-200 font-semibold mb-2">Швидкі шаблони</label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(presets).map(([key, preset]) => (
                  <button
                    key={key}
                    onClick={() => loadPreset(preset)}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition text-sm"
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Model Specifications */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-purple-300 mb-3 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Специфікація моделі
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-purple-200 text-sm mb-1">Об'єм моделі (мл)</label>
                  <input
                    type="number"
                    value={inputs.volumeMl}
                    onChange={(e) => handleChange('volumeMl', e.target.value)}
                    className="w-full bg-white/5 border border-purple-300/30 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-purple-200 text-sm mb-1">Об'єм підтримок (мл)</label>
                  <input
                    type="number"
                    value={inputs.supportVolumeMl}
                    onChange={(e) => handleChange('supportVolumeMl', e.target.value)}
                    className="w-full bg-white/5 border border-purple-300/30 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-purple-200 text-sm mb-1">Час друку (години)</label>
                  <input
                    type="number"
                    value={inputs.printTimeHours}
                    onChange={(e) => handleChange('printTimeHours', e.target.value)}
                    className="w-full bg-white/5 border border-purple-300/30 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-purple-200 text-sm mb-1">Відсоток браку (%)</label>
                  <input
                    type="number"
                    value={inputs.failureRate}
                    onChange={(e) => handleChange('failureRate', e.target.value)}
                    className="w-full bg-white/5 border border-purple-300/30 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>
            </div>

            {/* Material Costs */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-purple-300 mb-3 flex items-center gap-2">
                <Droplets className="w-5 h-5" />
                Вартість матеріалів
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-purple-200 text-sm mb-1">Ціна смоли ($/літр)</label>
                  <input
                    type="number"
                    value={inputs.resinPricePerLiter}
                    onChange={(e) => handleChange('resinPricePerLiter', e.target.value)}
                    className="w-full bg-white/5 border border-purple-300/30 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-purple-200 text-sm mb-1">Ціна ізопропанолу ($/літр)</label>
                  <input
                    type="number"
                    value={inputs.isopropanolPricePerLiter}
                    onChange={(e) => handleChange('isopropanolPricePerLiter', e.target.value)}
                    className="w-full bg-white/5 border border-purple-300/30 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-purple-200 text-sm mb-1">Використання ІПС на друк (мл)</label>
                  <input
                    type="number"
                    value={inputs.ipaUsagePerPrint}
                    onChange={(e) => handleChange('ipaUsagePerPrint', e.target.value)}
                    className="w-full bg-white/5 border border-purple-300/30 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>
            </div>

            {/* Equipment Costs */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-purple-300 mb-3">Амортизація обладнання</h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-purple-200 text-sm mb-1">Вартість принтера ($)</label>
                    <input
                      type="number"
                      value={inputs.printerCost}
                      onChange={(e) => handleChange('printerCost', e.target.value)}
                      className="w-full bg-white/5 border border-purple-300/30 rounded-lg px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-purple-200 text-sm mb-1">Термін служби (друків)</label>
                    <input
                      type="number"
                      value={inputs.printerLifespanPrints}
                      onChange={(e) => handleChange('printerLifespanPrints', e.target.value)}
                      className="w-full bg-white/5 border border-purple-300/30 rounded-lg px-3 py-2 text-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-purple-200 text-sm mb-1">Вартість FEP плівки ($)</label>
                    <input
                      type="number"
                      value={inputs.fepFilmCost}
                      onChange={(e) => handleChange('fepFilmCost', e.target.value)}
                      className="w-full bg-white/5 border border-purple-300/30 rounded-lg px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-purple-200 text-sm mb-1">Термін служби (друків)</label>
                    <input
                      type="number"
                      value={inputs.fepLifespanPrints}
                      onChange={(e) => handleChange('fepLifespanPrints', e.target.value)}
                      className="w-full bg-white/5 border border-purple-300/30 rounded-lg px-3 py-2 text-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-purple-200 text-sm mb-1">Вартість столика ($)</label>
                    <input
                      type="number"
                      value={inputs.buildPlateCost}
                      onChange={(e) => handleChange('buildPlateCost', e.target.value)}
                      className="w-full bg-white/5 border border-purple-300/30 rounded-lg px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-purple-200 text-sm mb-1">Термін служби (друків)</label>
                    <input
                      type="number"
                      value={inputs.buildPlateLifespanPrints}
                      onChange={(e) => handleChange('buildPlateLifespanPrints', e.target.value)}
                      className="w-full bg-white/5 border border-purple-300/30 rounded-lg px-3 py-2 text-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Energy Costs */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-purple-300 mb-3 flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Енергозатрати
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-purple-200 text-sm mb-1">Споживання енергії (Вт)</label>
                  <input
                    type="number"
                    value={inputs.powerConsumptionWatts}
                    onChange={(e) => handleChange('powerConsumptionWatts', e.target.value)}
                    className="w-full bg-white/5 border border-purple-300/30 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-purple-200 text-sm mb-1">Тариф електроенергії ($/кВт·год)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={inputs.electricityPricePerKwh}
                    onChange={(e) => handleChange('electricityPricePerKwh', e.target.value)}
                    className="w-full bg-white/5 border border-purple-300/30 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-purple-200 text-sm mb-1">УФ-засвітка (хв)</label>
                    <input
                      type="number"
                      value={inputs.uvCuringTimeMinutes}
                      onChange={(e) => handleChange('uvCuringTimeMinutes', e.target.value)}
                      className="w-full bg-white/5 border border-purple-300/30 rounded-lg px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-purple-200 text-sm mb-1">Потужність УФ (Вт)</label>
                    <input
                      type="number"
                      value={inputs.uvCuringWatts}
                      onChange={(e) => handleChange('uvCuringWatts', e.target.value)}
                      className="w-full bg-white/5 border border-purple-300/30 rounded-lg px-3 py-2 text-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Labor & Overhead */}
            <div>
              <h3 className="text-lg font-semibold text-purple-300 mb-3 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Робота та накладні витрати
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-purple-200 text-sm mb-1">Час роботи (хвилини)</label>
                  <input
                    type="number"
                    value={inputs.laborTimeMinutes}
                    onChange={(e) => handleChange('laborTimeMinutes', e.target.value)}
                    className="w-full bg-white/5 border border-purple-300/30 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-purple-200 text-sm mb-1">Ставка оплати ($/годину)</label>
                  <input
                    type="number"
                    value={inputs.laborRatePerHour}
                    onChange={(e) => handleChange('laborRatePerHour', e.target.value)}
                    className="w-full bg-white/5 border border-purple-300/30 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-purple-200 text-sm mb-1">Накладні витрати (%)</label>
                  <input
                    type="number"
                    value={inputs.overheadPercentage}
                    onChange={(e) => handleChange('overheadPercentage', e.target.value)}
                    className="w-full bg-white/5 border border-purple-300/30 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>
            </div>

            {/* ============ ДОДАТИ ТУТ ПОЧАТОК ============ */}
            {/* Painting Section */}
            <div className="mt-6 pt-6 border-t border-purple-300/30">
              <div className="flex items-center gap-3 mb-4">
                <input
                  type="checkbox"
                  id="includePainting"
                  checked={inputs.includePainting}
                  onChange={(e) => handleChange('includePainting', e.target.checked)}
                  className="w-5 h-5 rounded bg-white/5 border-purple-300/30 cursor-pointer"
                />
                <label htmlFor="includePainting" className="text-lg font-semibold text-purple-300 flex items-center gap-2 cursor-pointer">
                  <Palette className="w-5 h-5" />
                  Фарбування моделі
                </label>
              </div>

              {inputs.includePainting && (
                <div className="space-y-4 pl-2">
                  {/* Presets для фарбування */}
                  <div>
                    <label className="block text-purple-200 font-semibold mb-2">Рівень складності</label>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(paintingPresets).map(([key, preset]) => (
                        <button
                          key={key}
                          onClick={() => loadPaintingPreset(key as keyof typeof paintingPresets)}
                          className={`px-4 py-2 rounded-lg transition text-sm ${
                            inputs.paintingComplexity === key
                              ? 'bg-pink-600 text-white'
                              : 'bg-purple-600/50 text-purple-200 hover:bg-purple-600'
                          }`}
                        >
                          {preset.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Матеріали для фарбування */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-purple-200 text-sm mb-1">Вартість ґрунтовки ($)</label>
                      <input
                        type="number"
                        value={inputs.primerCost}
                        onChange={(e) => handleChange('primerCost', e.target.value)}
                        className="w-full bg-white/5 border border-purple-300/30 rounded-lg px-3 py-2 text-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-purple-200 text-sm mb-1">Кількість кольорів</label>
                        <input
                          type="number"
                          value={inputs.numberOfColors}
                          onChange={(e) => handleChange('numberOfColors', e.target.value)}
                          className="w-full bg-white/5 border border-purple-300/30 rounded-lg px-3 py-2 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-purple-200 text-sm mb-1">Ціна за колір ($)</label>
                        <input
                          type="number"
                          value={inputs.paintCostPerColor}
                          onChange={(e) => handleChange('paintCostPerColor', e.target.value)}
                          className="w-full bg-white/5 border border-purple-300/30 rounded-lg px-3 py-2 text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-purple-200 text-sm mb-1">Вартість лаку ($)</label>
                      <input
                        type="number"
                        value={inputs.varnishCost}
                        onChange={(e) => handleChange('varnishCost', e.target.value)}
                        className="w-full bg-white/5 border border-purple-300/30 rounded-lg px-3 py-2 text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-purple-200 text-sm mb-1">Вартість пензлів ($)</label>
                      <input
                        type="number"
                        value={inputs.brushesCost}
                        onChange={(e) => handleChange('brushesCost', e.target.value)}
                        className="w-full bg-white/5 border border-purple-300/30 rounded-lg px-3 py-2 text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-purple-200 text-sm mb-1">Інші матеріали ($)</label>
                      <input
                        type="number"
                        value={inputs.otherMaterialsCost}
                        onChange={(e) => handleChange('otherMaterialsCost', e.target.value)}
                        className="w-full bg-white/5 border border-purple-300/30 rounded-lg px-3 py-2 text-white"
                      />
                      <p className="text-xs text-purple-300 mt-1">Розчинники, палітра, серветки</p>
                    </div>

                    <div>
                      <label className="block text-purple-200 text-sm mb-1">Час фарбування (години)</label>
                      <input
                        type="number"
                        value={inputs.paintingTimeHours}
                        onChange={(e) => handleChange('paintingTimeHours', e.target.value)}
                        className="w-full bg-white/5 border border-purple-300/30 rounded-lg px-3 py-2 text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-purple-200 text-sm mb-1">Ставка за фарбування ($/год)</label>
                      <input
                        type="number"
                        value={inputs.paintingLaborRate}
                        onChange={(e) => handleChange('paintingLaborRate', e.target.value)}
                        className="w-full bg-white/5 border border-purple-300/30 rounded-lg px-3 py-2 text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-purple-200 text-sm mb-1">Відсоток браку при фарбуванні (%)</label>
                      <input
                        type="number"
                        value={inputs.paintingFailureRate}
                        onChange={(e) => handleChange('paintingFailureRate', e.target.value)}
                        className="w-full bg-white/5 border border-purple-300/30 rounded-lg px-3 py-2 text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-purple-200 text-sm mb-1">Накладні витрати на фарбування (%)</label>
                      <input
                        type="number"
                        value={inputs.paintingOverheadPercentage}
                        onChange={(e) => handleChange('paintingOverheadPercentage', e.target.value)}
                        className="w-full bg-white/5 border border-purple-300/30 rounded-lg px-3 py-2 text-white"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
            {/* ============ ДОДАТИ ТУТ КІНЕЦЬ ============ */}
          </div>

          {/* Results Panel */}
          <div className="space-y-6">
            {/* Total Cost */}
            <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl p-6 shadow-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">ЗАГАЛЬНА ВАРТІСТЬ ДРУКУ</p>
                  <p className="text-5xl font-bold text-white mt-2">
                    ${costs.printingTotalCost.toFixed(2)}
                  </p>
                </div>
                <DollarSign className="w-16 h-16 text-white/30" />
              </div>
            </div>

            {/* Cost Breakdown */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-purple-300/20">
              <h3 className="text-xl font-bold text-white mb-4">Деталізація витрат</h3>
              
              <div className="space-y-3">
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-purple-200 font-semibold">Вартість матеріалів</span>
                    <span className="text-white font-bold">${costs.materialCost.toFixed(2)}</span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between text-purple-300">
                      <span>Смола ({inputs.volumeMl + inputs.supportVolumeMl}мл)</span>
                      <span>${costs.resinCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-purple-300">
                      <span>ІПС ({inputs.ipaUsagePerPrint}мл)</span>
                      <span>${costs.ipaCost.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 rounded-lg p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-purple-200 font-semibold">Амортизація обладнання</span>
                    <span className="text-white font-bold">${costs.equipmentCost.toFixed(2)}</span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between text-purple-300">
                      <span>Принтер</span>
                      <span>${costs.printerDepreciation.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-purple-300">
                      <span>FEP плівка</span>
                      <span>${costs.fepDepreciation.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-purple-300">
                      <span>Столик</span>
                      <span>${costs.buildPlateDepreciation.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 rounded-lg p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-purple-200 font-semibold">Енергозатрати</span>
                    <span className="text-white font-bold">${costs.energyCost.toFixed(2)}</span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between text-purple-300">
                      <span>Друк ({inputs.printTimeHours}год)</span>
                      <span>${costs.printEnergyCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-purple-300">
                      <span>УФ-засвітка ({inputs.uvCuringTimeMinutes}хв)</span>
                      <span>${costs.uvEnergyCost.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <span className="text-purple-200 font-semibold">Робота</span>
                    <span className="text-white font-bold">${costs.laborCost.toFixed(2)}</span>
                  </div>
                  <div className="text-sm text-purple-300 mt-1">
                    {inputs.laborTimeMinutes} хвилин @ ${inputs.laborRatePerHour}/год
                  </div>
                </div>

                <div className="bg-white/5 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <span className="text-purple-200 font-semibold">Коригування на брак</span>
                    <span className="text-white font-bold">${costs.printingFailureAdjustment.toFixed(2)}</span>
                  </div>
                  <div className="text-sm text-purple-300 mt-1">
                    {inputs.failureRate}% від проміжної суми
                  </div>
                </div>

                <div className="bg-white/5 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <span className="text-purple-200 font-semibold">Накладні витрати</span>
                    <span className="text-white font-bold">${costs.printingOverhead.toFixed(2)}</span>
                  </div>
                  <div className="text-sm text-purple-300 mt-1">
                    {inputs.overheadPercentage}% (оренда, комунальні послуги тощо)
                  </div>
                </div>
              </div>
            </div>

            {/* Per Unit Analysis */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-purple-300/20">
              <h3 className="text-xl font-bold text-white mb-4">Аналіз витрат</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-purple-200">Вартість за мл смоли</span>
                  <span className="text-white font-semibold">
                    ${(costs.printingTotalCost / (inputs.volumeMl + inputs.supportVolumeMl)).toFixed(3)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-200">Вартість за годину друку</span>
                  <span className="text-white font-semibold">
                    ${(costs.printingTotalCost / inputs.printTimeHours).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-200">Матеріали від загальної вартості</span>
                  <span className="text-white font-semibold">
                    {((costs.materialCost / costs.printingTotalCost) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            {/* ============ ДОДАТИ ТУТ ПОЧАТОК ============ */}
            {/* Painting Total Cost - показується тільки якщо включено фарбування */}
            {inputs.includePainting && (
              <>
                {/* Total Painting Cost */}
                <div className="bg-gradient-to-br from-pink-600 to-orange-600 rounded-xl p-6 shadow-2xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-pink-100 text-sm font-medium">ВАРТІСТЬ ФАРБУВАННЯ</p>
                      <p className="text-5xl font-bold text-white mt-2">
                        ${costs.paintingTotalCost.toFixed(2)}
                      </p>
                    </div>
                    <Palette className="w-16 h-16 text-white/30" />
                  </div>
                </div>

                {/* Painting Cost Breakdown */}
                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-purple-300/20">
                  <h3 className="text-xl font-bold text-white mb-4">Деталізація витрат на фарбування</h3>
                  
                  <div className="space-y-3">
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-purple-200 font-semibold">Матеріали для фарбування</span>
                        <span className="text-white font-bold">${costs.paintingMaterialCost.toFixed(2)}</span>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between text-purple-300">
                          <span>Ґрунтовка</span>
                          <span>${costs.primerCost.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-purple-300">
                          <span>Фарби ({inputs.numberOfColors} кольорів)</span>
                          <span>${costs.totalPaintsCost.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-purple-300">
                          <span>Лак</span>
                          <span>${costs.varnishCost.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-purple-300">
                          <span>Пензлі</span>
                          <span>${costs.brushesCost.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-purple-300">
                          <span>Інші матеріали</span>
                          <span>${costs.otherMaterialsCost.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="flex justify-between items-center">
                        <span className="text-purple-200 font-semibold">Робота з фарбування</span>
                        <span className="text-white font-bold">${costs.paintingLaborCost.toFixed(2)}</span>
                      </div>
                      <div className="text-sm text-purple-300 mt-1">
                        {inputs.paintingTimeHours} годин @ ${inputs.paintingLaborRate}/год
                      </div>
                    </div>

                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="flex justify-between items-center">
                        <span className="text-purple-200 font-semibold">Коригування на брак</span>
                        <span className="text-white font-bold">${costs.paintingFailureAdjustment.toFixed(2)}</span>
                      </div>
                      <div className="text-sm text-purple-300 mt-1">
                        {inputs.paintingFailureRate}% від проміжної суми
                      </div>
                    </div>

                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="flex justify-between items-center">
                        <span className="text-purple-200 font-semibold">Накладні витрати</span>
                        <span className="text-white font-bold">${costs.paintingOverhead.toFixed(2)}</span>
                      </div>
                      <div className="text-sm text-purple-300 mt-1">
                        {inputs.paintingOverheadPercentage}% (оренда, комунальні послуги тощо)
                      </div>
                    </div>
                  </div>
                </div>

                {/* Combined Total */}
                <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl p-6 shadow-2xl border-2 border-yellow-400/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm font-medium">ЗАГАЛЬНА ВАРТІСТЬ (ДРУК + ФАРБУВАННЯ)</p>
                      <p className="text-5xl font-bold text-white mt-2">
                        ${costs.combinedTotalCost.toFixed(2)}
                      </p>
                      <div className="flex gap-4 mt-3 text-sm">
                        <div>
                          <span className="text-purple-200">Друк: </span>
                          <span className="text-white font-semibold">${costs.printingTotalCost.toFixed(2)}</span>
                        </div>
                        <div>
                          <span className="text-purple-200">Фарбування: </span>
                          <span className="text-white font-semibold">${costs.paintingTotalCost.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                    <DollarSign className="w-16 h-16 text-white/30" />
                  </div>
                </div>
              </>
            )}
            {/* ============ ДОДАТИ ТУТ КІНЕЦЬ ============ */}
          </div>
        </div>
      </div>
    </div>
  );
}