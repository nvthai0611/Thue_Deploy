"use client";

import React, { useState, useEffect } from "react";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import { FacilityCodeMap } from "@/utils/constants/facility-codes";

interface RoomInteriorsProps {
  checkedCodes?: number[];
  onChange?: (codes: number[]) => void;
}

export default function RoomInteriors({
  checkedCodes = [],
  onChange,
}: RoomInteriorsProps) {
  const [selectedCodes, setSelectedCodes] = useState<number[]>(checkedCodes);

  useEffect(() => {
    setSelectedCodes(checkedCodes);
  }, [checkedCodes]);

  const handleChange = (code: number) => {
    let newSelected: number[];
    if (selectedCodes.includes(code)) {
      newSelected = selectedCodes.filter((c) => c !== code);
    } else {
      newSelected = [...selectedCodes, code];
    }
    setSelectedCodes(newSelected);
    onChange?.(newSelected);
  };

  return (
    <div>
      <Label>Facilities</Label>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-2">
        {Object.entries(FacilityCodeMap).map(([codeStr, name]) => {
          const code = Number(codeStr);
          return (
            <div key={code} className="flex items-center space-x-2">
              <Checkbox
                id={`facility-${code}`}
                checked={selectedCodes.includes(code)}
                onCheckedChange={() => handleChange(code)}
              />
              <Label htmlFor={`facility-${code}`}>{name}</Label>
            </div>
          );
        })}
      </div>
    </div>
  );
}
